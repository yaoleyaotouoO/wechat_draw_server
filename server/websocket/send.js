const webSocketController = require('../controllers/websocket');

module.exports = async (wss, ws, message) => {
    switch (message.type) {
        case 'joinRoom':
            webSocketController.joinRoom(wss, ws, message.data);
            break;
        case 'startGame':
            webSocketController.startGame(wss, ws, message.data);
        case 'submitAnswer':
            webSocketController.submitAnswer(wss, ws, message.data);
        case 'updateCanvas':
            webSocketController.updateCanvas(wss, ws, message.data);
        default:
            console.warn('websocket not send message type');
    }
}