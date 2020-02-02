const { sqlQuery } = require('../db/db');
const RoomCache = require('../caches/roomCache');
const UserCache = require('../caches/userCache');
const moment = require('moment');
const { RoomStatus } = require('../common/enums');
const { broadcast } = require('../common/websocketUtil');
const _ = require('lodash');
const { StartGameContext } = require('../websocket/startGame');
const { CheckAnswerContext } = require('../websocket/checkAnswer');

module.exports = {
    getRoomUserByRoomId(roomId, removeWs = true) {
        const userList = UserCache.getAll();
        const roomUser = Object.values(userList)
            .filter(x => x.roomId === roomId)
            .sort((x, y) => x.id - y.id);

        if (removeWs) {
            return roomUser.map(item => _.omit(item, 'ws'));
        }
        return roomUser;
    },
    /**
        data:
        {
            roomId: string;
            userId: number;
            user: {
            id: number;
            nickName: string;
            avatarUrl: string;
            roomId: string;
            }
        }
    **/
    async joinRoom(wss, ws, data) {
        const { roomId, userId, user } = data;
        const roomData = RoomCache.get(roomId);

        if (!roomData) {
            ws.send(JSON.stringify({
                data: {
                    roomId,
                    errMsg: '加入房间失败，房间不存在！'
                },
                type: 'joinRoomFail'
            }));
            return;
        }

        if (roomData.status === RoomStatus.Running) {
            ws.send(JSON.stringify({
                data: {
                    roomId,
                    errMsg: '加入房间失败，房间正在游戏中！'
                },
                type: 'joinRoomFail'
            }));
            return;
        }

        let roomUser = this.getRoomUserByRoomId(roomId);
        if (roomUser.length >= 6) {
            ws.send(JSON.stringify({
                data: {
                    roomId,
                    errMsg: '加入房间失败，房间人数已满！'
                },
                type: 'joinRoomFail'
            }));
            return;
        }

        UserCache.set(userId, { ...user, ...{ ws } });
        roomUser = this.getRoomUserByRoomId(roomId);

        // 广播更新用户
        broadcast(wss, JSON.stringify({
            data: {
                roomId,
                userList: roomUser
            },
            type: 'updateRoomUser'
        }));
    },
    /**
      data:
      {
          roomId: string;
          userId: number;
      }
    **/
    async startGame(wss, ws, data) {
        const { roomId, userId } = data;

        new StartGameContext(wss, roomId, userId);
    },
    /**
     data:
     {
         roomId: string;
         answer: string;
         userId: number;
     }
   **/
    async submitAnswer(wss, ws, data) {
        new CheckAnswerContext(wss, data);
    },
    /**
    data:
    {
        type: string; // canvas type
        x: number;
        y: number;
        data: string;
        roomId: string;
    }
    **/
    async updateCanvas(wss, ws, data) {
        broadcast(wss, JSON.stringify({
            data,
            type: 'updateCanvas'
        }));
    },
    async getRandomTopic() {
        let sql = `SELECT count(*) count FROM draw_topic`;
        let topicCount = await sqlQuery(sql);
        let randomCount = parseInt(Math.random() * topicCount[0].count + 1);

        sql = `SELECT * FROM topic WHERE Id = ?`;
        let values = [isNaN(randomCount) ? 0 : randomCount];

        return sqlQuery(sql, values);
    }
}