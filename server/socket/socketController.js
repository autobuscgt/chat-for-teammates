const roomMessages = new Map();
const roomUsers = {};

const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, '../assets/images');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

class SocketConnection {
    async handleConnection(socket, io) {
        console.log('user connected');
        console.log(`user ${socket.user.login} connected`);

        socket.emit('rooms list', Array.from(roomMessages.keys()));

        socket.on('join', ({ room, user }) => {
            this.handleJoinRoom(socket, room, io);
        });

        socket.on('chat message', async (msgData) => {
            this.handleChatMessage(socket, msgData, io);
        });

        socket.on('chat image', async (data) => {
            await this.handleChatImage(socket, data, io);
        });

        socket.on('get rooms', () => {
            socket.emit('rooms list', Array.from(roomMessages.keys()));
        });

        socket.on('get users', (room) => {
            this.handleGetUsers(socket, room, io);
        });

        socket.on('change color', (data) => {
            this.handleChangeColor(socket, data, io);
        });

        socket.on('clear chat', (data) => {
            this.handleClearChat(socket, data, io);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
            this.handleDisconnect(socket, io);
        });

        // socket.on('durov', async () => {
        //     this.handleDurov(socket, io)
        // })
    }
    // async handleDurov(socket){
    //     const newMessage = {
    //         id: Date.now(),
    //         text: 'ПАВЕЛ ДУРОВ',
    //         type: 'text'
    //     };
    //     socket.emit('chat message', newMessage);
    // }

    async handleJoinRoom(socket, room, io) {
        socket.join(room);
        socket.room = room;
        console.log(`user ${socket.user.login} (${socket.id}) joined room: ${room}`);

        if (!roomUsers[room]) {
            roomUsers[room] = new Map();
        }

        roomUsers[room].set(socket.id, {
            id: socket.user.id,
            login: socket.user.login
        });

        const messages = roomMessages.get(room) || [];
        socket.emit('chat message', messages);
        socket.emit('message', {
            message: `Приветствую в комнате ${room}`
        });

        io.to(room).emit('users in room', Array.from(roomUsers[room].values()));
    }

    async handleChatMessage(socket, msgData, io) {
        const { text, room, timestamp } = msgData;
        
        if (!roomMessages.has(room)) {
            roomMessages.set(room, []);
        }
        
        const newMessage = {
            id: Date.now(),
            text: text,
            timestamp: timestamp,
            userId: socket.user.id,
            user: socket.user.login,
            type: 'text'
        };
        
        const currentMessages = roomMessages.get(room);
        currentMessages.push(newMessage);
        roomMessages.set(room, currentMessages);

        io.to(room).emit('chat message', currentMessages);
        
        if (roomUsers[room]) {
            io.to(room).emit('users in room', Array.from(roomUsers[room].values()));
        }
    }

    async handleChatImage(socket, data, io) {
        try {
            const { file, metadata } = data;
            const { room, timestamp, userId, user, filename, fileType } = metadata;
            
            if (!file || !room) {
                socket.emit('error', { message: 'Invalid image data' });
                return;
            }

            const base64Data = file.split(',')[1] || file;
            const buffer = Buffer.from(base64Data, 'base64');

            const fileExtension = path.extname(filename) || '.jpg';
            const uniqueFilename = `${Date.now()}_${socket.user.id}_${Math.random().toString(36).substring(7)}${fileExtension}`;
            const filePath = path.join(imagesDir, uniqueFilename);

            fs.writeFileSync(filePath, buffer);

            const imageUrl = `/assets/images/${uniqueFilename}`;
            
            const newMessage = {
                id: Date.now(),
                text: null,
                imageUrl: imageUrl,
                filename: filename,
                timestamp: timestamp || new Date().toISOString(),
                userId: socket.user.id,
                user: socket.user.login,
                type: 'image'
            };

            if (!roomMessages.has(room)) {
                roomMessages.set(room, []);
            }
            
            const currentMessages = roomMessages.get(room);
            currentMessages.push(newMessage);
            
            if (currentMessages.length > 1000) {
                currentMessages.shift();
            }
            
            roomMessages.set(room, currentMessages);

            io.to(room).emit('chat message', currentMessages);
            
            socket.emit('image uploaded', { success: true, url: imageUrl });
            
        } catch (error) {
            console.error('Error in handleChatImage:', error);
            socket.emit('error', { message: 'Failed to send image' });
        }
    }

    handleDisconnect(socket, io) {
        for (const room in roomUsers) {
            if (roomUsers[room] && roomUsers[room].has(socket.id)) {
                roomUsers[room].delete(socket.id);
                if (roomUsers[room].size === 0) {
                    delete roomUsers[room];
                } else {
                    io.to(room).emit('users in room', Array.from(roomUsers[room].values()));
                }
            }
        }
    }

    async handleGetRooms(socket) {
        socket.emit('rooms list', Array.from(roomMessages.keys()));
    }

    async handleClearChat(socket, data, io) {
        const { room, userId } = data;
        
        if (!room) {
            socket.emit('error', { message: 'Комната не найдена' });
            return;
        }

        if (roomMessages.has(room)) {

            const clearMessage = {
                id: Date.now(),
                text: `Чат был очищен пользователем ${socket.user.login}`,
                timestamp: new Date().toISOString(),
                userId: 'system',
                user: 'System',
                type: 'system'
            };
            roomMessages.set(room, [clearMessage]);

            io.to(room).emit('chat clear');
            io.to(room).emit('chat message', [clearMessage]);

            console.log(`Chat in room ${room} was cleared by ${socket.user.login}`);
        }
    }

    async handleGetUsers(socket, room, io) {
        if (roomUsers[room]) {
            const users = Array.from(roomUsers[room].values());
            const userList = users.map(u => u.login).join(', ');
            
            const message = {
                id: Date.now(),
                text: `Пользователи в комнате (${users.length}): ${userList}`,
                timestamp: new Date().toISOString(),
                userId: 'system',
                user: 'System',
                type: 'text'
            };
            
            if (!roomMessages.has(room)) {
                roomMessages.set(room, []);
            }
            
            const currentMessages = roomMessages.get(room);
            currentMessages.push(message);
            roomMessages.set(room, currentMessages);
            
            io.to(room).emit('chat message', currentMessages);
        }
    }
    
    async handleChangeColor(socket, data, io) {
        const { room, userId, color } = data;
        
        const message = {
            id: Date.now(),
            text: `${socket.user.login} изменил цвет ника на ${color}`,
            timestamp: new Date().toISOString(),
            userId: 'system',
            user: 'System',
            type: 'text'
        };
        
        if (roomMessages[room]) {
            const currentMessages = roomMessages.get(room);
            currentMessages.push(message);
            roomMessages.set(room, currentMessages);
            io.to(room).emit('chat message', currentMessages);
        }
    }
}

module.exports = new SocketConnection();