const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');

exports.getUserByDiscordId = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { guild } = req.body;

  const user = await User.findOne({ id, guild });

  if (!user) {
    return next(new AppError("No user found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user
    }
  });
});

// CRUD STUFF

exports.getAllUsers = catchAsync(async (req, res, next) => {
  if (!req.filter) req.filter = {};

  const features = new APIFeatures(User.find(req.filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({ path: "group" });

  res.status(200).json({
    status: "success",
    data: {
      user
    }
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  let { id, familyName, characterClass, stance, regularAp, awakeningAp, dp, level, guild } = req.body;

  regularAp = regularAp * 1
  awakeningAp = awakeningAp * 1
  dp = dp * 1
  let gearscore;

  if (stance === "succession") {
    gearscore = regularAp + dp;
  } else {
    gearscore = Math.floor((regularAp + awakeningAp) / 2 + dp);
  }

  const newUser = await User.create({
    id,
    familyName,
    characterClass,
    stance,
    regularAp,
    awakeningAp,
    dp,
    level,
    gearscore,
    guild
  })

  res.status(201).json({
    status: "success",
    data: {
      user: newUser
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  // if(req.query.regularAp || req.query.awakeningAp || req.query.dp) req.query.lastUpdate = Date.now();

  const user = await User.findByIdAndUpdate(id, req.query, {
    new: true,
    runValidators: true
  });

  if (!user) return next(new AppError("No user found", 404));

  res.status(201).json({
    status: "success",
    data: {
      user
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { deletedBy, guild } = req.query;

  // 1. FIND USER
  const user = await User.findOne({ _id: id, guild });
  if (!user) return next(new AppError("This user doesn\'t exist", 404));

  // 2. UPDATE DOC
  await User.findOneAndUpdate({ _id: id, guild }, { active: false, deletedAt: Date.now(), deletedBy }).catch(console.log);

  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.deleteUserByDiscordId = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { deletedBy, guild } = req.query;

  // 1. FIND USER
  const user = await User.findOne({ id, guild }).catch(console.log);
  if (!user) return next(new AppError("This user doesn\'t exist", 404));

  // 2. UPDATE DOC
  await User.findOneAndUpdate({ id, guild }, { active: false, deletedAt: Date.now(), deletedBy });

  res.status(204).json({
    status: "success",
    data: null
  });
});