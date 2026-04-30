const Router = require('express');
const messageController = require('../controllers/messageController');
const router = new Router();

router.get('/:id', messageController.getOne);
router.get('/', messageController.getAll);
router.get('/room   /:roomId', messageController.getMessageByRoom);
router.post('/', messageController.createMessage);
router.delete('/:id', messageController.deleteMessage);
router.put('/:id', messageController.updateMessage);

module.exports = router;