const catchAsync = require('../utils/catchAsync');

exports.protect = catchAsync(async (req, res, next) => {
  // check if id of the user hitting the endpoint is equal the id of doc he wants to modify

  // GRANT ACCESS TO PROTECTED ROUTES
  next();
});

exports.restrictToRole = catchAsync(async (req, res, next) => {
  // check if admin etc

  next();
});