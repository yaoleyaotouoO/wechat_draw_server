const { sqlQuery } = require('../db/db');
const RoomCache = require('../caches/roomCache');
const { uuid } = require('uuidv4');
const { RoomStatus } = require('../common/enums');

module.exports = {
    async addUserInfo({ nickName, avatarUrl }) {
        let sql = `SELECT * FROM userinfo WHERE nickName = ?`;
        let values = [nickName];

        let result = await sqlQuery(sql, values);
        if (result.length) {
            return result[0].id;
        }

        sql = `INSERT INTO userinfo(id, nickName, avatarUrl)  VALUES (0, ?, ?)`;
        values = [nickName, avatarUrl];
        result = await sqlQuery(sql, values);

        return result.insertId;
    },
    async getUserInfoByName({ nickName }) {
        let sql = `SELECT * FROM userinfo WHERE nickName = ?`;
        let values = [nickName];

        let result = await sqlQuery(sql, values);
        if (!result.length) {
            return {
                errMsg: '用户没有授权，请返回到首页授权'
            }
        }

        const user = result[0];
        return user;
    },
    async createRoom({ roomName, nickName }) {
        const roomUsers = RoomCache.getAll();
        const findRoomName = Object.values(roomUsers).find(item => item.roomName === roomName);
        if (findRoomName) {
            return {
                errMsg: '已存在同样的房间名，请换一个！'
            };
        }

        const id = uuid();
        RoomCache.set(id, {
            roomId: id,
            roomName: roomName,
            status: RoomStatus.Ready
        });

        return {
            data: id
        };
    },
    async findRoom({ roomName, nickName }) {
        const roomList = RoomCache.getAll();
        const findRoomName = Object.values(roomList).find(item => item.roomName === roomName);
        if (findRoomName) {
            const roomId = findRoomName.roomId;
            return {
                data: roomId
            };
        }

        return {
            errMsg: '未找到房间名！'
        };
    }
}