const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');

// security
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController');
const guildRouter = require('./routes/guildRoutes');
const groupRouter = require('./routes/groupRoutes');
const userRouter = require('./routes/userRoutes');
const eventRouter = require('./routes/eventRoutes');



const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost/' })); // TODO: make it work
//app.options(cors());

// limit max requests 
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP. Please, try again in an hour."
});
app.use('/api', limiter);

app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
};


app.use('/api/v1/guilds', guildRouter);
app.use('/api/v1/groups', groupRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/events', eventRouter);

// for all undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
});

app.use(globalErrorHandler);

module.exports = app;