const express = require('express');
const { createGroup, deleteGroup, assignOne, assignMany } = require('../controllers/groupController');

const router = express.Router({ mergeParams: true });

router.patch('/:id/assign-one', assignOne)
router.patch('/:id/assign-many', assignMany)
router.post('/', createGroup);
router.delete('/:id', deleteGroup);

module.exports = router;