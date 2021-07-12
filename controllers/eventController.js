const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Event = require('../models/eventModel');
const User = require('../models/userModel');


exports.getAllEvents = catchAsync(async (req, res, next) => {
  let queryStr = JSON.stringify(req.query);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  let query = Event.find();
  query.find(JSON.parse(queryStr));

  const events = await query;

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

  // 1. CREATE EVENT
  const newEvent = await Event.create({
    date,
    type,
    mandatory,
    alerts,
    content,
    messageId,
    guild
  });


  // 2. PUSH USERS TO UNDECIDED ARRAY - MIDDLEWARE NEEDED, MAYBE NESTED ROUTE
  const userDocs = await User.find({ guild })
  userDocs.map(doc => newEvent.undecidedMembers.push(doc._id))

  await newEvent.save();

  const populated = await Event.populate(newEvent, [{
    path: 'guild',
    select: "groups"
  },
  {
    path: 'undecidedMembers',
    populate: {
      path: "",
      select: "group",
      model: 'User'
    }
  }]);

  res.status(201).json({
    status: "success",
    data: {
      event: populated
    }
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  const { type, alerts, content, mandatory } = req.body;

  const event = await Event.findByIdAndUpdate(id, {
    type,
    alerts,
    content,
    mandatory
  }, {
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
  const event = await Event.findByIdAndUpdate(id, { active: false });

  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.changeUserGroup = catchAsync(async (req, res, next) => {
  const { eventId, goToGroup, userDiscordId } = req.body;
  // 1. Find necessary data
  const event = await Event.findById(eventId);

  // check if capped
  if (event.yesMembers.length >= event.maxCount) return next(new AppError("Signups are full", 403))

  // check if closed
  if ((event.date.getTime() - new Date(Date.now()).getTime()) <= 1.5 * 60 * 60 * 1000) return next(new AppError("Signups are closed", 403))

  const user = await User.findOne({ id: userDiscordId });
  if (!user) return next(new AppError("User is not a part of the guild.", 400))

  switch (goToGroup) {
    case "yes": {
      // 2a. Remove user doc from "undecided" and "no" arrays IF it is there
      const undecidedUser = event.undecidedMembers.find(member => member._id.equals(user._id));
      if (undecidedUser) event.undecidedMembers.pull(undecidedUser._id);

      const noUser = event.noMembers.find(member => member._id.equals(user._id));
      if (noUser) event.noMembers.pull(noUser._id);

      // 3a. Add user doc to "yes" array if it doesnt contain it already
      const yesUser = event.yesMembers.find(member => member._id.equals(user._id));
      if (yesUser) return next(new AppError("User already exists", 400));
      event.yesMembers.push(user._id);

      break;
    };
    case "no": {
      // 2b. Remove user doc from "undecided" and "yes" arrays IF it is there
      const undecidedUser = event.undecidedMembers.find(member => member._id.equals(user._id));
      if (undecidedUser) event.undecidedMembers.pull(undecidedUser._id);

      const yesUser = event.yesMembers.find(member => member._id.equals(user._id));
      if (yesUser) event.yesMembers.pull(yesUser._id);

      // 3b. Add user doc to "no" array if it doesnt contain it already
      const noUser = event.noMembers.find(member => member._id.equals(user._id));
      if (noUser) return next(new AppError("User already exists", 400));
      event.noMembers.push(user._id);

      break;
    };
  };

  await event.save();

  // 4. Populate
  const populated = await Event.populate(event, [{
    path: 'guild',
    select: 'groups'
  }, {
    path: 'undecidedMembers',
    populate: {
      path: "",
      select: "group",
      model: 'User'
    }
  },
  {
    path: 'noMembers',
    populate: {
      path: "",
      select: "group",
      model: 'User'
    }
  },
  {
    path: 'yesMembers',
    populate: {
      path: "",
      select: "group",
      model: 'User'
    }
  }]);

  res.status(201).json({
    status: "success",
    data: {
      event: populated
    }
  });
});