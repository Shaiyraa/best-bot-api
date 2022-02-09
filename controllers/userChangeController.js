const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const UserChange = require('../models/userChangeModel');

exports.getAllUserChanges = catchAsync(async (req, res, next) => {
  const userId = req.query.user;
  const userChanges = await UserChange.find({ user: userId }).sort({ _id: -1 }).limit(10)

  res.status(200).json({
    status: "success",
    results: userChanges.length,
    data: {
      userChanges
    }
  });
});

exports.getUserChange = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userChange = await UserChange.findById(id)

  res.status(200).json({
    status: "success",
    data: {
      userChange
    }
  });
});