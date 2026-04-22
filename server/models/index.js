const { User } = require("./User");
const { Message } = require("./Message");
const { Room } = require("./Room");

User.hasMany(Message, {foreignKey: 'userId'});
Message.belongsTo(User, {foreignKey: 'userId'});

Room.hasMany(Message, {foreignKey:'roomId'});
Message.belongsTo(Room, {foreignKey:'roomId'});

User.hasMany(Room, {foreignKey:'userId'})
Room.belongsTo(User, {foreignKey:'userId'})