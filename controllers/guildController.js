const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Guild = require('../models/guildModel');

exports.getGuildByDiscordId = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const guild = await Guild.findOne({ id });

  if (!guild) {
    return next(new AppError("No guild found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      guild
    }
  });
});


// BASE CRUD
exports.getAllGuilds = catchAsync(async (req, res, next) => {
  const guilds = await Guild.find();

  res.status(200).json({
    status: "success",
    results: guilds.length,
    data: {
      guilds
    }
  });
});

exports.getGuild = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const guild = await Guild.findById(id);

  res.status(200).json({
    status: "success",
    data: {
      guild
    }
  });
});

exports.createGuild = catchAsync(async (req, res, next) => {
  const { id, memberRole, officerRole, announcementsChannel, remindersChannel } = req.body;

  const newGuild = await Guild.create({
    id,
    memberRole,
    officerRole,
    announcementsChannel,
    remindersChannel
  });

  res.status(201).json({
    status: "success",
    data: {
      guild: newGuild
    }
  });
});

exports.updateGuild = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  const guild = await Guild.findByIdAndUpdate(id, req.query, {
    new: true,
    runValidators: true
  });

  if (!guild) return next(new AppError("No guild found", 404));

  res.status(201).json({
    status: "success",
    data: {
      guild
    }
  });
});

exports.deleteGuild = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Guild.findByIdAndUpdate(id, { active: false });

  res.status(204).json({
    status: "success",
    data: null
  });
});

// exports.getAttendance = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const { startDate, endDate } = req.query;

//   const guild = await Guild.findById(id);
//   if (!guild) return next(new AppError("No guild found", 404));

//   const events = await Event.find({ guild: id, date: { $gte: startDate, $lte: endDate } })

//   // 1. make an object with family names as keys
//   const users = await User.find({ guild: id })

//   let usersObj = {}
//   users.forEach(user => {
//     usersObj[user._id].familyName = user.familyName
//     usersObj[user._id].attended = 0
//     usersObj[user._id].totalEventCount = 0
//     usersObj[user._id].percentage = 0
//   })

//   // 2. loop through yesArrays of each event

//   /*
//   return
//   [{
//     familyName,
//     id,
//     attended: count,
//     totalEventCount: count
//     percentage
//   }]
//   */

// });