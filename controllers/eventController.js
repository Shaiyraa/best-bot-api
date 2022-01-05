const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Event = require('../models/eventModel');
const Alert = require('../models/alertModel');
const User = require('../models/userModel');


exports.getAllEvents = catchAsync(async (req, res, next) => {
  if (!req.filter) req.filter = {};

  const features = new APIFeatures(Event.find(req.filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const events = await features.query;

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
  const { date, type, mandatory, alerts, maxCount, content, messageId, messageChannelId, guild } = req.body;

  console.log("CHANNEL ID", messageChannelId)
  const existing = await Event.findOne({ date, guild })
  if (existing) return next(new AppError("There is already an event with this date.", 409))

  // 1. CREATE EVENT
  const newEvent = await Event.create({
    date,
    type,
    mandatory,
    alerts,
    maxCount,
    content,
    messageChannelId,
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

  // 3. CREATE REMINDERS
  // const alert1Date = new Date(date)
  // alert1Date.setHours(alert1Date.getHours() - 5)
  // const alert2Date = new Date(date)
  // alert2Date.setHours(alert2Date.getHours() - 4)
  const alert3Date = new Date(date)
  alert3Date.setHours(alert3Date.getHours() - 3)
  const alert4Date = new Date(date)
  alert4Date.setHours(alert4Date.getHours() - 2)

  // const alert1 = await Alert.create({
  //   event: newEvent._id,
  //   type: "undecided",
  //   date: alert1Date
  // })
  // const alert2 = await Alert.create({
  //   event: newEvent._id,
  //   type: "undecided",
  //   date: alert2Date
  // })
  const alert3 = await Alert.create({
    event: newEvent._id,
    type: "undecided",
    date: alert3Date
  })
  const alert4 = await Alert.create({
    event: newEvent._id,
    type: "undecided",
    date: alert4Date
  })

  res.status(201).json({
    status: "success",
    data: {
      event: populated,
      alerts: [alert3, alert4]
    }
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  const { _id, active, yesMembers, noMembers, undecidedMembers, waitlistedMembers, date, messageId, messageChannelId, guild, ...otherProps } = req.query;

  const event = await Event.findByIdAndUpdate(id, otherProps, {
    new: true,
    runValidators: true
  });

  if (otherProps.maxCount) {
    console.log("otherProps maxCount")
    if (event.waitlistedMembers.length >= 1) {
      console.log("waitlist has items")
      let freeSpace = event.maxCount - event.yesMembers.length;
      for (let i = 0; i < freeSpace; i++) {
        let memberToMove = event.waitlistedMembers[0];
        console.log(memberToMove)
        event.waitlistedMembers.splice(0, 1);
        console.log("spliced")

        event.yesMembers.push(memberToMove._id);
        console.log(event.yesMembers)
      };
    };
  };

  if (!event) return next(new AppError("No event found", 404));

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
  },
  {
    path: 'waitlistedMembers',
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

exports.updateEventMessageId = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  const { messageId } = req.query;

  const event = await Event.findByIdAndUpdate(id, { messageId }, {
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

exports.changeUserGroup = catchAsync(async (req, res, next) => {
  const { eventId, goToGroup, userDiscordId } = req.body;
  // 1. Find necessary data
  const event = await Event.findById(eventId);

  // check if capped
  //if (event.yesMembers.length >= event.maxCount && goToGroup === "yes") return next(new AppError("Signups are full", 403))

  // check if closed
  if ((event.date.getTime() - new Date(Date.now()).getTime()) <= 1 * 60 * 60 * 250) return next(new AppError("Signups are closed", 403))

  const user = await User.findOne({ id: userDiscordId, guild: event.guild });

  // TODO: check if still has member role
  if (!user) return next(new AppError("Not a member.", 400))

  switch (goToGroup) {
    case "yes": {
      // 2a. Remove user doc from "undecided" and "no" arrays IF it is there
      const undecidedUser = event.undecidedMembers.find(member => member._id.equals(user._id));
      if (undecidedUser) event.undecidedMembers.pull(undecidedUser._id);

      const noUser = event.noMembers.find(member => member._id.equals(user._id));
      if (noUser) event.noMembers.pull(noUser._id);

      const yesUser = event.yesMembers.find(member => member._id.equals(user._id));
      const waitlistedUser = event.waitlistedMembers.find(member => member._id.equals(user._id));
      if (yesUser || waitlistedUser) return next(new AppError("Already reacted with \"yes\".", 400));

      // CHECK IF WAITLIST
      if (event.yesMembers.length >= event.maxCount) {
        // TODO: waitlist
        console.log(event.waitlistedMembers)
        event.waitlistedMembers.push(user._id);
        console.log(event.waitlistedMembers)

      } else {
        // 3a. Add user doc to "yes" array if it doesnt contain it already
        event.yesMembers.push(user._id);
      };
      break;
    };
    case "no": {
      // TODO: IF SOMEONE IS WAITLISTED, SWITCH HIM TO YES
      if (event.waitlistedMembers[0]) {
        const memberToMove = event.waitlistedMembers[0];
        //console.log(event.waitlistedMembers)
        event.waitlistedMembers.splice(0, 1);
        //console.log(event.waitlistedMembers)

        // if waitlisted[0] member is the same as the current one
        if (!user._id.equals(memberToMove._id)) {
          event.yesMembers.push(memberToMove._id);
        };
      };

      // 2b. Remove user doc from "undecided" and "yes" arrays IF it is there
      const undecidedUser = event.undecidedMembers.find(member => member._id.equals(user._id));
      if (undecidedUser) event.undecidedMembers.pull(undecidedUser._id);

      const yesUser = event.yesMembers.find(member => member._id.equals(user._id));
      if (yesUser) event.yesMembers.pull(yesUser._id);

      // 3b. Add user doc to "no" array if it doesnt contain it already
      const noUser = event.noMembers.find(member => member._id.equals(user._id));
      if (noUser) return next(new AppError("Already reacted with \"no\".", 400));
      event.noMembers.push(user._id);

      break;
    };
    case "undecided": {
      // 2b. Remove user doc from "no" and "yes" arrays IF it is there
      const noUser = event.noMembers.find(member => member._id.equals(user._id));
      if (noUser) event.noMembers.pull(noUser._id);

      const yesUser = event.yesMembers.find(member => member._id.equals(user._id));
      if (yesUser) event.yesMembers.pull(yesUser._id);

      // 3b. Add user doc to "undecided" array if it doesnt contain it already
      const undecidedUser = event.undecidedMembers.find(member => member._id.equals(user._id));
      if (undecidedUser) return next(new AppError("Already undecided.", 400));
      event.undecidedMembers.push(user._id);

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
  },
  {
    path: 'waitlistedMembers',
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