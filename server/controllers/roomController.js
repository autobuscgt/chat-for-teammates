const { Room } = require("../models/Room");
const { User } = require("../models/User");

class RoomController {
    async getOne(req,res){
        const {id} = req.params;
        const candidate = await Room.findByPk(id);
        return res.send(candidate);
    };
    async getAll(req,res){
        const rooms = await Room.findAll();
        return res.status(200).json(rooms);
    };
    async createRoom(req,res){
        try {
            const {userId, name} = req.body;
            const room = await Room.create({userId, name});
            return res.status(200).json({message:`Комната: ${room.name} - успешно создана`});
        } catch (error) {
            console.log(error);
        }
    };
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
    };
}

module.exports = new RoomController();