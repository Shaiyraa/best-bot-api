const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');
const UserChange = require('../models/userChangeModel');

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

  const user = await User.findById(id)
  if (!user) return next(new AppError("User not found", 404));

  if (req.query.regularAp) {
    await UserChange.create({
      changedField: "ap",
      oldValue: user.regularAp,
      newValue: req.query.regularAp,
      user: user._id
    })
  }
  if (req.query.awakeningAp) {
    await UserChange.create({
      changedField: "aap",
      oldValue: user.awakeningAp,
      newValue: req.query.awakeningAp,
      user: user._id
    })
  }
  if (req.query.dp) {
    await UserChange.create({
      changedField: "dp",
      oldValue: user.dp,
      newValue: req.query.dp,
      user: user._id
    })
  }

  const updatedUser = await User.findByIdAndUpdate(id, req.query, {
    new: true,
    runValidators: true
  });

  res.status(201).json({
    status: "success",
    data: {
      user: updatedUser
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { deletedBy, guild } = req.query;

  // 1. FIND USER
  const user = await User.findById(id);
  if (!user) return next(new AppError("This user doesn\'t exist", 404));

  // 2. UPDATE DOC
  user.active = false;
  user.deletedAt = Date.now();
  user.deletedBy = deletedBy;
  await user.save();

  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.deleteUserByDiscordId = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { deletedBy, guild } = req.query;

  // 1. FIND USER
  const user = await User.findOne({ id, guild });

  if (!user) return next(new AppError("This user doesn\'t exist", 404));

  // 2. UPDATE DOC
  user.active = false;
  user.deletedAt = Date.now();
  user.deletedBy = deletedBy;
  await user.save();

  res.status(204).json({
    status: "success",
    data: null
  });
});