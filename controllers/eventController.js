const catchAsync = require('../utils/catchAsync');
const Event = require('../models/eventModel');

exports.getAllEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find();

  res.status(200).json({
    status: "success",
    results: events.length,
    data: {
      events
    }
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const event = await Event.findById(id);

  res.status(200).json({
    status: "success",
    data: {
      event
    }
  });
});

exports.createEvent = catchAsync(async (req, res, next) => {
  const { date, type, mandatory, alerts, content, messageId, guild } = req.body;

  const newEvent = await Event.create({
    date,
    type,
    mandatory,
    alerts,
    content,
    messageId,
    guild
  });

  res.status(201).json({
    status: "success",
    data: {
      event: newEvent
    }
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  const event = await Event.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!event) return next(new AppError("No event found", 404));

  res.status(201).json({
    status: "success",
    data: {
      event
    }
  });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Event.findByIdAndUpdate(id, { active: false });

  res.status(204).json({
    status: "success",
    data: null
  });
});