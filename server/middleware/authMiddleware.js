const jwt = require('jsonwebtoken');

function authMiddleware(socket, next) {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        return next(new Error('Authentication error'));
    }
    
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        socket.user = decoded;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
}

module.exports = authMiddleware;