const express = require('express');
const { getAllAlerts } = require('../controllers/alertController');

const router = express.Router();

router.get('/', getAllAlerts)


module.exports = router;