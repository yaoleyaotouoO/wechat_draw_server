let users = {};

/**
   {
        id: {
            id: string;
            nickName: string;
            avatarUrl: string;
            score: number;
            status: UserStatus;
            roomId: string;
            ws: WebSocket;
            isBingo: boolean; // 答对题目的 flag
        }
    }
**/

module.exports = {
    set(key, value) {
        const userData = this.get(key);
        users = Object.assign({}, users, { [key]: { ...userData, ...value } });
        console.info(`cache info users: set key: ${key}, value: ${JSON.stringify(value)}, users: ${JSON.stringify(users)}`);
    },
    getAll() {
        console.info(`cache info users: getAll value: ${JSON.stringify(users)}`);
        return users;
    },
    get(key) {
        console.info(`cache info users: get key: ${key}, value: ${JSON.stringify(users[key])}`);
        return users[key];
    },
    delete(key) {
        console.info(`cache info users: delete key: ${key}, value: ${JSON.stringify(users[key])}`);
        delete users[key];
    }
}