const express = require('express');
const validateLogin = require('../middleware/validateLogin');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/signup',validateLogin, userController.signup);
router.post('/login',validateLogin, userController.login);


router.get('/all', userController.getAllUsers);
router.get('/userbyid/:id', userController.getUserById);
router.get('/currentUser', auth, userController.getCurrentUser);


router.delete('/deleteUser' , userController.deleteUser);

router.put('/activity', userController.updateLastActive);

module.exports = router;