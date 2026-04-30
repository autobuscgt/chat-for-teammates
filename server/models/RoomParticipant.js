const sequelize = require('../config/config')
const {DataTypes, UUIDV4} = require('sequelize')

const RoomParticipant = sequelize.define('room_participants', {
    id: {type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true},
    roomId: {type: DataTypes.UUID, allowNull: false},
    userId: {type: DataTypes.UUID, allowNull: false},
    joinedAt: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    isActive: {type: DataTypes.BOOLEAN, defaultValue: true}
})

module.exports = {RoomParticipant};