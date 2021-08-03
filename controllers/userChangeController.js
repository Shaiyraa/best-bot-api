const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const UserChange = require('../models/userChangeModel');

exports.getAllUserChanges = catchAsync(async (req, res, next) => {
  if (!req.filter) req.filter = {};

  const features = new APIFeatures(UserChange.find(req.filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const userChanges = await features.query;

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