

const { Room } = require("../models/Room");
const { User } = require("../models/User");
const bcrypt = require('bcrypt');

class RoomController {
    async getOne(req,res){
        const {id} = req.params;
        const candidate = await Room.findByPk(id);
        return res.send(candidate);
    };

    async createRoom(req,res){
        try {
            const {userId, name, type, password} = req.body;
            const exist = await Room.findOne({where:{name}});
            if(exist){
                return res.status(403).json({message:'Такая комната уже существует!'})
            }
            const user = await User.findByPk(userId);
            console.log(typeof(userId));
            if (!user) {
                return res.status(404).json({ 
                    error: `Пользователь с id ${userId} не найден` 
                });
            }
            let hashedPassword = null;
            if(password){
                hashedPassword = await bcrypt.hash(password, 10);
            }
            const room = await Room.create({userId, name, type: type || 'public', password: hashedPassword});
            return res.status(200).json({message:`Комната: ${room.name} - успешно создана`});
        } catch (error) {
            console.log(error);
        }
    };

    async getAll(req,res){
        const rooms = await Room.findAll({where: {type: 'public'}});
        return res.status(200).json({rooms});
    };

    async getPrivateRoom(req,res) { 
        const privateRooms =  Room.findAll({where:{type:'private'},                 
        include: [{
            model: RoomParticipant,
            where: { userId: socket.user.id, isActive: true },
            required: true
        }]
        }); 
        return res.status(200).json(privateRooms)
    }

    async updateRoom(req,res){
        const {userId, id} = req.params;
        const {name} = req.body;
        const candidate = await Room.findByPk(id);
        await candidate.update({userId, name});
        return res.send(`Сообщение с id: ${id} было обновлено.`);
    };

    async deleteRoom(req,res){
        const {id} = req.params;
        const candidate = await Room.findByPk(id);
        await candidate.destroy();
        return res.send(`Сообщение с id: ${id} было удалено.`);
    }
}

module.exports = new RoomController();