const { broadcast } = require('../common/websocketUtil');
const RoomCache = require('../caches/roomCache');
const UserCache = require('../caches/userCache');
const { uuid } = require('uuidv4');

class CheckAnswerContext {
    constructor(webSocketController, wss, { roomId, answer, userId }) {
        this.webSocketController = webSocketController;
        this.wss = wss;
        this.roomId = roomId;
        this.answer = answer;
        this.userId = userId;
        this.userName = UserCache.get(userId).nickName;
        this.roomCache = {};

        this.checkAnswer();
    }

    async checkAnswer() {
        this.roomCache = RoomCache.get(this.roomId);
        let message = '';

        if (this.roomCache.topicName === this.answer) {
            // TODO 记录答对的人和第几次答对
            await this.recordCorrectAnswerInfo();

            // TODO 重新获取一下用户数据, 为了拿最新的分数 
            const userList = this.webSocketController.getRoomUserByRoomId(this.roomId, false);
            broadcast(this.wss, JSON.stringify({
                data: { roomId: this.roomId, userList },
                type: 'updateRoomUser'
            }));

            message = `答对了!`;
        } else {
            message = this.answer;
        }

        broadcast(this.wss, JSON.stringify({
            data: { roomId: this.roomId, message: { id: uuid(), author: this.userName, message } },
            type: 'updateMessage'
        }));
    }

    async recordCorrectAnswerInfo() {
        let userInfo = UserCache.get(this.userId);
        // 已经答对过了
        if (userInfo.isBingo) {
            return;
        }
        UserCache.set(this.userId, { isBingo: true });

        // 答对题的人数
        let answerNumber = this.roomCache.answerNumber || 0;
        answerNumber = ++answerNumber;
        let score = 0;
        if (answerNumber === 1) {
            score = 3;
        } else if (answerNumber === 2) {
            score = 2;
        } else {
            score = 1;
        }

        UserCache.set(this.userId, { score });
        RoomCache.set(this.roomId, { answerNumber });
    }
}


module.exports = {
    CheckAnswerContext
}