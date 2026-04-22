// MessageController.js
const { Message } = require("../models/Message");
const { User } = require("../models/User");

class MessageController {
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const message = await Message.findByPk(id);
            
            if (!message) {
                return res.status(404).json({ error: "Сообщение не найдено" });
            }
            
            return res.status(200).json(message);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
    }

    async getAll(req, res) {
        try {
            const messages = await Message.findAll({
                order: [['createdAt', 'ASC']],
                
            include: [
                {model: User, as: 'user', attributes:['id','login']},
                {model: Room, as: 'room', attributes:['id','name']}
            ]
        
            });
            return res.status(200).json(messages);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
    }

    async getMessageByRoom(req,res){
        const {roomId} = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const messages = await Message.findAndCountAll({
                where: { roomId },
                include: [{
                    model: User,
                    attributes: ['id', 'login']
                }],
                order: [['createdAt', 'ASC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
        });
        
        return res.status(200).json({
                messages: messages.rows,
                total: messages.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
        });
    }

    async createMessage(req, res) {
        try {
            const { userId, text, file, roomId } = req.body;
            
            if (!text) {
                return res.status(400).json({ error: "Текст сообщения обязателен" });
            }
            
            const message = await Message.create({ userId, text, file, roomId });
            const user = await User.findByPk(userId);
            return res.status(201).json({
                id:message.id,
                text:message.text,
                userId:message.userId,
                roomId:message.roomId,
                userLogin: user?.login,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
    }
    
    async updateMessage(req, res) {
        try {
            const { id } = req.params;
            const { userId, text, file } = req.body;
            
            const message = await Message.findByPk(id);
            if (!message) {
                return res.status(404).json({ error: "Сообщение не найдено" });
            }
            
            await message.update({ userId, text, file });
            return res.status(200).json(message);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
    }
    
    async deleteMessage(req, res) {
        try {
            const { id } = req.params;
            const message = await Message.findByPk(id);
            
            if (!message) {
                return res.status(404).json({ error: "Сообщение не найдено" });
            }
            
            await message.destroy();
            return res.status(200).json({ message: `Сообщение ${id} успешно удалено` });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
    }
}

module.exports = new MessageController();