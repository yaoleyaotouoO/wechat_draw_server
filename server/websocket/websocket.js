const ws = require('ws');
const webSocketSend = require('./send');
const OfflineUserCache = require('../caches/offlineUserCache');
const UserCache = require('../caches/userCache');
const moment = require('moment');

const WebSocketServer = ws.Server;

module.exports = (server) => {
    let wss = new WebSocketServer({
        server: server
    });

    wss.on('connection', (ws) => {
        new WebSocketConnection(ws, wss);
    });
}

class WebSocketConnection {
    constructor(ws, wss) {
        this.userId = '';
        this.userName = '';

        ws.on('message', (message) => {
            const messageData = JSON.parse(message);
            webSocketSend(wss, ws, messageData);
        });

        ws.on('error', (err) => {
            console.log(`errored: ${err}`);
        });

        ws.on('close', (event, data) => {
            console.log("close data: ", data);
            if (data.indexOf('userId') === -1) {
                console.error('ws on close error!');
                return;
            }
            
            const message = JSON.parse(data);
            const { userId } = message;
            UserCache.delete(userId);
            OfflineUserCache.set(userId, { id: userId, offlineTime: moment() });
        });
    }
}