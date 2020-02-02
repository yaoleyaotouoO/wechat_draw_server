let roomUsers = {};

/**
    {
        roomId: {
            roomId: string;
            roomName: string;
            status: RoomStatus;
            topicName: string;
            topicPrompt: string;
            answerNumber: number; 答对题目的人数
        }
    }
**/

module.exports = {
    set(key, value) {
        const roomData = this.get(key);
        roomUsers = Object.assign({}, roomUsers, { [key]: { ...roomData, ...value } });
        console.info(`cache info roomusers: set key: ${key}, value: ${JSON.stringify(value)}, roomUsers: ${JSON.stringify(roomUsers)} `);
    },
    getAll() {
        console.info(`cache info roomusers: getAll value: ${JSON.stringify(roomUsers)}`);
        return roomUsers;
    },
    get(key) {
        console.info(`cache info roomusers: get key: ${key}, value: ${JSON.stringify(roomUsers[key])}`);
        return roomUsers[key];
    },
    delete(key) {
        console.info(`cache info roomusers: delete key: ${key}, value: ${JSON.stringify(roomUsers[key])}`);
        delete roomUsers[key];
    }
}