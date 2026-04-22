const sequelize = require('../config/config')
const {DataTypes, UUIDV4} = require('sequelize')

const Message = sequelize.define('messages',{
    id:{type:DataTypes.UUID, defaultValue:UUIDV4, primaryKey:true},
    userId:{type:DataTypes.UUID, allowNull:false},
    roomId:{type:DataTypes.UUID, allowNull:false},
    text:{type:DataTypes.TEXT, allowNull:false},
    file:{type:DataTypes.STRING}
})

module.exports = {Message};