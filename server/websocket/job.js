const OfflineUserCache = require('../caches/offlineUserCache');
const UserCache = require('../caches/userCache');
const moment = require('moment');

const serviceStartDeleteExpiredUser = async () => {
    const userCache = OfflineUserCache.getAll();
    const userList = Object.values(userCache);
    const currentTime = moment();

    for (let i = 0; i < userList.length; i++) {
        const item = userList[i];
        // 判断用户是否 5 分钟内都没有重新进入游戏
        const isExpires = currentTime.diff(moment(item.offlineTime), 'seconds') > 60 * 5;
        isExpires && UserCache.delete(item.id);
    }
}

const startJob = () => {
    setInterval(() => {
        serviceStartDeleteExpiredUser();
    }, 1000 * 60 * 2);
}

module.exports = () => {
    startJob
}
