const RoomCache = require('../caches/roomCache');
const UserCache = require('../caches/userCache');
const { broadcast } = require('../common/websocketUtil');
const { RoomStatus } = require('../common/enums');

const OneRoundTime = 100;
const RefreshUserTime = 10;

class StartGameContext {
    constructor(webSocketController, wss, roomId, userId) {
        this.webSocketController = webSocketController;
        this.wss = wss;
        this.roomId = roomId;
        this.topicName = '';
        this.topicPrompt = '';
        this.gameTime = 0;
        this.gameRound = 0;
        this.gameTotalRound = 0;
        this.userList = [];
        this.drawUserId = userId;
        this.gamePollTag = null;

        this.initGame();
    }

    async initGame() {
        RoomCache.set(this.roomId, { status: RoomStatus.Running });
        broadcast(this.wss, JSON.stringify({
            data: { roomId: this.roomId, drawUserId: this.drawUserId },
            type: 'startGame'
        }));

        this.everyRoundOfTheGameStartCheckingUsers();
        await this.getTopic();
        this.startTheGame();
    }

    async getTopic() {
        let topicDataList = await this.webSocketController.getRandomTopic();
        let topicData = topicDataList[0];
        this.topicName = topicData.name;
        this.topicPrompt = topicData.prompt;

        // 获取新一轮的时间
        this.gameTime = OneRoundTime;
    }

    startTheGame() {
        this.gamePollTag = setInterval(async () => {
            if (!this.gameTime && ((this.gameRound + 1) === this.gameTotalRound)) {
                await this.gameOverDisplayScore();
            }

            if (!this.gameTime) {
                await this.showAnswersEveryRoundOfGame();
            }

            if (!(this.gameTime % RefreshUserTime)) {
                await this.everyRoundOfTheGameStartCheckingUsers();
            }

            this.sendMessageToUser();
            this.judgeAllUserCorrect();

            this.gameTime--;
        }, 1000);
    }

    async judgeAllUserCorrect() {
        this.userList = this.webSocketController.getRoomUserByRoomId(this.roomId, false);
        const filterUserList = this.userList.filter(item => item.id !== this.drawUserId);
        const isEveryBingo = filterUserList.every(item => item.isBingo);
        if (isEveryBingo && (this.gameRound + 1) === this.gameTotalRound) {
            await this.gameOverDisplayScore();
        }
        if (isEveryBingo) {
            await this.showAnswersEveryRoundOfGame();
        }
    }

    sendMessageToUser() {
        let gameInfo = {
            drawUserId: this.drawUserId,
            roomId: this.roomId,
            topicName: this.topicName,
            topicPrompt: this.topicPrompt
        }

        RoomCache.set(this.roomId, gameInfo);
        const roomData = RoomCache.get(this.roomId);
        broadcast(this.wss, JSON.stringify({
            data: {
                roomData,
                roomId: this.roomId,
                gameTime: this.gameTime
            },
            type: 'updateGameInfo'
        }));
    }

    async gameOverDisplayScore() {
        RoomCache.set(this.roomId, { status: RoomStatus.Ready });
        let gameOverScoreList = this.webSocketController.getRoomUserByRoomId(this.roomId);
        gameOverScoreList = gameOverScoreList.sort((a, b) => a.score < b.score);

        // TODO 游戏结束统计分数
        broadcast(this.wss, JSON.stringify({
            data: {
                roomId: this.roomId,
                userList: gameOverScoreList
            },
            type: 'gameOver'
        }));

        // 清空分数
        gameOverScoreList.map(item => {
            UserCache.set(item.id, { score: 0 });
        });

        clearInterval(this.gamePollTag);

        return true;
    }

    getDrawUserId() {
        if ((this.gameRound + 1) > this.gameTotalRound) {
            return;
        }

        // 获取第一轮画图的用户
        if (this.gameRound === 0) {
            this.drawUserId = this.userList[0].id;
            RoomCache.set(this.roomId, { drawUserId: this.drawUserId });
            return;
        }

        this.drawUserId = this.userList[this.gameRound].id;
        RoomCache.set(this.roomId, { drawUserId: this.drawUserId });
    }

    async showAnswersEveryRoundOfGame() {
        this.gameRound++;
        console.log(`第 ${this.gameRound + 1} 轮游戏`);

        // 通知前端弹窗显示答案
        broadcast(this.wss, JSON.stringify({
            data: { roomId: this.roomId, topicName: this.topicName },
            type: 'showAnswer'
        }), UserCache.get(this.drawUserId).ws);

        // 下一个人画, 重新计时重新出题
        await this.getTopic();
        this.getDrawUserId();

        // 重置答对题的人数
        RoomCache.set(this.roomId, { answerNumber: 0 });

        // 每轮开始的时候，都重置这个房间用户答对题目的 Flag
        const userList = this.webSocketController.getRoomUserByRoomId(this.roomId, false);
        userList.map(item => {
            UserCache.set(item.id, { isBingo: false });
        });
        // 刷新用户
        this.userList = this.webSocketController.getRoomUserByRoomId(this.roomId, false);
    }

    // 定时查一下最新用户列表，看是否有用户离线了
    async everyRoundOfTheGameStartCheckingUsers() {
        this.userList = this.webSocketController.getRoomUserByRoomId(this.roomId, false);
        // 根据用户数，确定游戏轮数
        this.gameTotalRound = this.userList.length;
        this.getDrawUserId();
    }
}

module.exports = {
    StartGameContext
}