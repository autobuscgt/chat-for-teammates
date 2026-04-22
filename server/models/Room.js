const sequelize = require('../config/config')
const {DataTypes, UUIDV4} = require('sequelize')

const Room = sequelize.define('rooms',{
    id:{type:DataTypes.UUID, defaultValue:UUIDV4, primaryKey:true},
    userId:{type:DataTypes.UUID},
    name:{type:DataTypes.STRING},
    
})

module.exports = {Room};