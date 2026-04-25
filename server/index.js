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
const jwt = require('jsonwebtoken');


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
const roomUsers = {};


io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        socket.user = decoded;
        next();

    } catch (err) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => { 
    console.log('user connected');
    console.log(`user ${socket.user.login} connected`);
    
    socket.emit('rooms list', Array.from(roomMessages.keys()));

    socket.on('join', ({room, user}) => {
        socket.join(room);
        socket.room = room;
        console.log(`user ${socket.id} joined room: ${room}`);
        
        if (!roomUsers[room]) {
        roomUsers[room] = new Map();
        }

        roomUsers[room].set(socket.id, {
            id: socket.user.id,
            login: socket.user.login
        });

        if (!roomUsers[room]) {
            roomUsers[room] = new Map();
        }
        
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
        const { text, room, timestamp, user, userId } = msgData;
        
        if (!roomMessages.has(room)) {
            roomMessages.set(room, []);
        }
        
        const newMessage = {
            text: text,
            timestamp: timestamp,
            userId: socket.user.id,
            user: socket.user.login
        };
        
        const currentMessages = roomMessages.get(room);
        currentMessages.push(newMessage);
        roomMessages.set(room, currentMessages);

        io.to(room).emit('chat message', currentMessages);
        io.to(room).emit('users in room', Array.from(roomUsers[room].values()));
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