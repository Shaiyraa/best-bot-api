const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.restrictToBot = catchAsync(async (req, res, next) => {
  let token;

  //check if token exists
  if (req.headers.authorization && req.headers.authorization.startsWith("Bot")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token || (token !== process.env.BOT_AUTH_TOKEN)) return next(new AppError("Whoah, hold on! Only the Bot can access this route.", 401));

  // GRANT ACCESS TO PROTECTED ROUTES
  next();
});

exports.restrictToRole = catchAsync(async (req, res, next) => {
  // check if admin etc

  next();
});