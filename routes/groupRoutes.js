const express = require('express');
const { createGroup, updateGroup, deleteGroup, assignOne, assignMany } = require('../controllers/groupController');

const router = express.Router({ mergeParams: true });

router.patch('/:id/assign-one', assignOne)
router.patch('/:id/assign-many', assignMany)
router.post('/', createGroup);
router.patch('/:id', updateGroup);
router.delete('/:id', deleteGroup);

module.exports = router;