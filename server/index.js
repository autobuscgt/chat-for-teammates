require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 7000;
const sequelize = require('./config/config');
const http = require('http');
const { Server } = require('socket.io');
const models = require('./models/index');
const router = require('./routes/index');

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use('/api', router);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

const roomMessages = new Map();

const users = [];
const rooms = [];

io.on('connection', (socket) => { 
    console.log('user connected');
    users.push(socket.id);
    socket.emit('rooms list', Array.from(roomMessages.keys()));

    socket.on('join', (room) => {
        socket.join(room);
        console.log(`user ${socket.id} joined room: ${room}`);

        if (roomMessages.has(room)) {
            rooms.push(room);
            socket.emit('chat message', roomMessages.get(room));
        } else {
            socket.emit('chat message', []);
        }
        
        socket.emit('message', {
            message: `Приветствую в комнате ${room}`
        });

    });

    socket.on('chat message', async (msgData) => {
        const { text, room, timestamp } = msgData;
        
        if (!roomMessages.has(room)) {
            roomMessages.set(room, []);
        }
        
        const newMessage = {
            text: text,
            timestamp: timestamp,
            user: socket.id 
        };
        
        const currentMessages = roomMessages.get(room);
        currentMessages.push(newMessage);
        roomMessages.set(room, currentMessages);
        io.to(room).emit('chat message', currentMessages);
    });

    socket.on('get rooms', () => {
        socket.emit('rooms list', Array.from(roomMessages.keys()));
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

async function start() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        server.listen(PORT, () => { 
            console.log(`Server is running on port http://localhost:${PORT}`); 
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

start();