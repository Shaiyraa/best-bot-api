const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
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
  let queryStr = JSON.stringify(req.query);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  let query = User.find();
  query.find(JSON.parse(queryStr));

  const users = await query;

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
  const { id, familyName, characterClass, stance, regularAp, awakeningAp, dp, guild } = req.body;
  const newUser = await User.create({
    id,
    familyName,
    characterClass,
    stance,
    regularAp,
    awakeningAp,
    dp,
    guild,
    group: '60eaf93a1b094451a83c45e7'
  });

  res.status(201).json({
    status: "success",
    data: {
      user: newUser
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;
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
  await User.findByIdAndUpdate(id, { active: false });

  res.status(204).json({
    status: "success",
    data: null
  });
});