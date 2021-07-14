const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Alert = require('../models/alertModel');

exports.getAllAlerts = catchAsync(async (req, res, next) => {
  let queryStr = JSON.stringify(req.query);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  let query = Alert.find();
  query.find(JSON.parse(queryStr));

  const alerts = await query;

  res.status(200).json({
    status: "success",
    results: alerts.length,
    data: {
      alerts
    }
  });
});