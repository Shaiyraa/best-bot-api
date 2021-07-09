const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');


// ADMIN STUFF

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

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
  const user = await User.findById(id);

  res.status(200).json({
    status: "success",
    data: {
      user
    }
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { id, familyName, characterClass, stance, regularAp, awakeningAp, dp, guild } = req.body;

  const newUser = await Event.create({
    id,
    familyName,
    characterClass,
    stance,
    regularAp,
    awakeningAp,
    dp,
    guild
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
  const user = await User.findByIdAndUpdate(id, req.body, {
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