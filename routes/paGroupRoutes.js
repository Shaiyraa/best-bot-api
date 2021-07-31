const express = require('express');
const { createPaGroup, getPaGroup, updatePaGroup, deletePaGroup, assignOne, assignMany, removeOne } = require('../controllers/paGroupController');

const router = express.Router({ mergeParams: true });

router.patch('/:id/assign-one', assignOne)
router.patch('/:id/assign-many', assignMany)
router.patch('/remove', removeOne)
router.post('/', createPaGroup);
router.get('/:paGroupId', getPaGroup);
router.patch('/:id', updatePaGroup);
router.delete('/:id', deletePaGroup);

module.exports = router;