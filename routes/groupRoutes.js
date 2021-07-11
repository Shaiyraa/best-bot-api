const express = require('express');
const { createGroup, assignGroup } = require('../controllers/groupController');

const router = express.Router({ mergeParams: true });

router.patch('/:id/assign', assignGroup)
router.post('/', createGroup);

module.exports = router;