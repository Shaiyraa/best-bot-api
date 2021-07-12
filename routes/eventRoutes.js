const express = require('express');
const { changeUserGroup, getAllEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.patch('/change-group', changeUserGroup);

router.get('/', getAllEvents);
router.get('/:id', getEvent);
router.post('/', createEvent);
router.patch('/:id', updateEvent);
router.delete('/:id', deleteEvent);


module.exports = router;