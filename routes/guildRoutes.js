const express = require('express');
const { getGuildByDiscordId, getAllGuilds, getGuild, createGuild, updateGuild, deleteGuild } = require('../controllers/guildController');
const groupRouter = require('../routes/groupRoutes');

const router = express.Router();
router.use('/:guildId/groups', groupRouter)

router.get('/', getAllGuilds);
router.get('/:groupId', getGuild);
router.post('/', createGuild);
router.patch('/:id', updateGuild);
router.delete('/:id', deleteGuild);

router.get('/discord/:id', getGuildByDiscordId);

module.exports = router;