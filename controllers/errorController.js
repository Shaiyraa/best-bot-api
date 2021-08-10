const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateValueDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: ${value}. Please use another value.`
  return new AppError(message, 400);
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(item => item.message)
  const message = `Invalid input data. ${errors.join(". ")}`;

  return new AppError(message, 400)
}

const handleJsonWebTokenError = () => new AppError("Invalid token. Please, log in again.", 401)

const handleTokenExpiredError = () => new AppError("Your token has expired. Please, log in again.", 401)

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  console.error("ERROR:", err);
  return res.status(err.statusCode).json({
    status: err.status,
    msg: err.message
  })

};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    console.log("ERROR:", err);

    return res.status(500).json({
      status: "error",
      message: "Whoops! Something went wrong"
    });
  };
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateValueDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJsonWebTokenError();
    if (error.name === "TokenExpiredError") error = handleTokenExpiredError();

    sendErrorProd(error, req, res);
  };
};
