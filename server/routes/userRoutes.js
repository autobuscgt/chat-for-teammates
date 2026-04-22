const Router = require('express');
const userController = require('../controllers/userController');
const router = new Router();

router.post('/login',userController.login)
router.post('/register',userController.register)
router.get('/getids', userController.getAll)

module.exports = router;