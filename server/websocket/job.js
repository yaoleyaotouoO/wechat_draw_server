const OfflineUserCache = require('../caches/offlineUserCache');
const UserCache = require('../caches/userCache');
const RoomCache = require('../caches/roomCache');
const moment = require('moment');

const serviceStartDeleteExpiredUser = async () => {
    const userCache = OfflineUserCache.getAll();
    const userList = Object.values(userCache);
    const currentTime = moment();

    for (let i = 0; i < userList.length; i++) {
        const item = userList[i];
        // 判断用户是否 30 秒内都没有重新进入游戏
        const isExpires = currentTime.diff(moment(item.offlineTime), 'seconds') > 30;
        isExpires && UserCache.delete(item.id);
    }
}

const serviceStartDeleteExpiredRoom = async () => {
    const roomCache = RoomCache.getAll();
    const roomList = Object.values(roomCache);

    for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i];

        const userList = UserCache.getAll();
        const roomUser = Object.values(userList)
            .filter(x => x.roomId === room.roomId);

        !roomUser.length && RoomCache.delete(room.roomId);
    }
}

const startJob = setInterval(() => {
    // serviceStartDeleteExpiredUser();
    serviceStartDeleteExpiredRoom();
}, 1000 * 10);


module.exports = () => {
    startJob
}
