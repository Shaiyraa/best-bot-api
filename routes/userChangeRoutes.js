const express = require('express');
const { getAllUserChanges, getUserChange } = require('../controllers/userChangeController');

const router = express.Router();

router.get('/', getAllUserChanges);
router.get('/:id', getUserChange);

module.exports = router;
