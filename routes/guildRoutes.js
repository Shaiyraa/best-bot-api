const express = require('express');
const { getGuildByDiscordId, getAllGuilds, getGuild, createGuild, updateGuild, deleteGuild, getAttendance } = require('../controllers/guildController');
const groupRouter = require('../routes/groupRoutes');
const paGroupRouter = require('../routes/paGroupRoutes');

const router = express.Router();
router.use('/:guildId/groups', groupRouter)
router.use('/:guildId/pa-groups', paGroupRouter)

router.get('/', getAllGuilds);
router.get('/:groupId', getGuild);
router.post('/', createGuild);
router.patch('/:id', updateGuild);
router.delete('/:id', deleteGuild);

router.get('/discord/:id', getGuildByDiscordId);

//router.get('/:id/attendance', getAttendance);

module.exports = router;