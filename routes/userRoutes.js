const express = require('express');
const { getUserByDiscordId, getAllUsers, getMe, getUser, createUser, updateUser, deleteUser, deleteUserByDiscordId } = require('../controllers/userController');

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

router.delete('/discord/:id', deleteUserByDiscordId);

router.get('/discord/:id', getUserByDiscordId);

module.exports = router;
