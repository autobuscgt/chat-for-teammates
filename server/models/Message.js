const sequelize = require('../config/config')
const {DataTypes, UUIDV4} = require('sequelize')

const Message = sequelize.define('messages', {
    id: {type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true},
    userId: {type: DataTypes.UUID, allowNull: false},
    roomId: {type: DataTypes.STRING, allowNull: false},
    text: {type: DataTypes.TEXT},
    imageUrl: {type: DataTypes.STRING},
    filename: {type: DataTypes.STRING},
    timestamp: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    type: {type: DataTypes.ENUM('image', 'text', 'system'), defaultValue: 'text'}
})

module.exports = {Message};