const express = require('express');
const { getAllUsers, getMe, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../controllers/authController');

const router = express.Router();

//router.use(protect)

//router.patch('/update-me', protect, updateUser)

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;