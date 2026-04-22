require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;
const sequelize = require('./config/config');
const http = require('http');
const {Server} = require('socket.io');
const models = require('./models/index');
const router = require('./routes/index');

app.use(express.json());
app.use(cors({origin:'*'}));
app.use('/api', router);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`новое подключение: ${socket.id}`)

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Пользователь ${socket.id} присоединился к комнате ${roomId}`);
        socket.emit('joined', { roomId, message: 'Вы присоединились к комнате' });
    });

    socket.on('send_message', async (data) => {
    console.log('Получено сообщение:', data);
        try {
            const message = await models.Message.create({
                text: data.text,
                userId: data.userId,
                roomId: data.roomId
            });

            io.to(data.roomId).emit('receive_message', {
                id: message.id,
                text: message.text,
                userId: data.userId,
                createdAt: message.createdAt
            });
            socket.on('disconnect', () => {
            console.log('❌ Пользователь отключился:', socket.id);
    });
        } catch (error) {
            console.error('Ошибка сохранения сообщения:', error);
        }
    });
})

async function start() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        server.listen(PORT, () => { console.log(`Server is running on port http://localhost:${PORT}`); })
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    };
};
start()
