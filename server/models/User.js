const sequelize = require('../config/config')
const {DataTypes, UUIDV4} = require('sequelize')

const User = sequelize.define('users',{
    id:{type:DataTypes.UUID,defaultValue:UUIDV4, primaryKey:true},
    login:{type:DataTypes.STRING, validate:{min:5}},
    password:{type:DataTypes.STRING, validate:{min:5}},
    role:{type:DataTypes.ENUM('ADMIN','USER'),defaultValue:'USER'}
})

module.exports = {User};