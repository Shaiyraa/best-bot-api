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