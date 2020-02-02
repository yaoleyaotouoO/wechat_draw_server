let offlineUsers = {};

/**
   {
      id: {
           id: string;
           offlineTime: string;
       }
    }
**/

module.exports = {
    set(key, value) {
        offlineUsers = Object.assign({}, offlineUsers, { [key]: value });
        console.info(`cache info offline: set key: ${key}, value: ${JSON.stringify(value)}, offlineUsers: ${JSON.stringify(offlineUsers)}`);
    },
    getAll() {
        console.info(`cache info offline: getAll value: ${JSON.stringify(offlineUsers)}`);
        return offlineUsers;
    },
    get(key) {
        console.info(`cache info offline: get key: ${key}, value: ${JSON.stringify(offlineUsers[key])}`);
        return offlineUsers[key];
    },
    delete(key) {
        console.info(`cache info offline: delete key: ${key}, value: ${JSON.stringify(offlineUsers[key])}`);
        delete offlineUsers[key];
    }
}