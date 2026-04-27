const authMiddleware = require('../middleware/authMiddleware')
const socketConnection = require('./socketController');
const { Server } = require('socket.io');

const socketConfig = {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
};

function createSocketServer(server) {
    return new Server(server, socketConfig);
}

function socketSetup(server) {
    const io = createSocketServer(server);

    io.use(authMiddleware);
    
    io.on('connection', (socket) => {
        socketConnection.handleConnection(socket, io);
    });
}

module.exports = socketSetup;