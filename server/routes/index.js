const Router = require('express');
const router = new Router();
const userRoutes = require('./userRoutes');
const messageRoutes = require('./messageRoutes');
const roomRoutes = require('./roomRoutes');

router.use('/auth', userRoutes);
router.use('/message', messageRoutes);
router.use('/room', roomRoutes);

module.exports = router;