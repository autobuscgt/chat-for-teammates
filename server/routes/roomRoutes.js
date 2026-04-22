const Router = require('express');
const roomController = require('../controllers/roomController');
const router = new Router();

router.get('/', roomController.getAll);
router.get('/:id', roomController.getOne);
router.post('/', roomController.createRoom);
router.delete('/:id', roomController.deleteRoom);
router.put('/:id', roomController.updateRoom);

module.exports = router;