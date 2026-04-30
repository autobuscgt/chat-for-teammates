const sequelize = require('../config/config')
const {DataTypes, UUIDV4} = require('sequelize')

const Room = sequelize.define('rooms',{
    id:{type:DataTypes.UUID, defaultValue:UUIDV4, primaryKey:true},
    userId:{type:DataTypes.UUID},
    name:{type:DataTypes.STRING},
    type: {type: DataTypes.ENUM('public', 'private'), defaultValue: 'public'},
    password: {type: DataTypes.STRING, allowNull: true},
    createdAt: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    updatedAt: {type: DataTypes.DATE, defaultValue: DataTypes.NOW}
})

module.exports = {Room};