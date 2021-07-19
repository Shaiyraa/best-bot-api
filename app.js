const fs = require('fs');
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
const { restrictToBot } = require('./controllers/authController');
const guildRouter = require('./routes/guildRoutes');
const groupRouter = require('./routes/groupRoutes');
const userRouter = require('./routes/userRoutes');
const eventRouter = require('./routes/eventRoutes');
const alertRouter = require('./routes/alertRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: '${process.env.API_URL}' })); // TODO: make it work
//app.options(cors());

// limit max requests 
const limiter = rateLimit({
  max: 500,
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
} else {
  const accessLogStream = fs.createWriteStream(__dirname + '/logs/' + "access.log", { flags: 'a' });
  app.use(morgan("combined", { stream: accessLogStream }));
}


app.use('/api/v1/guilds', restrictToBot, guildRouter);
app.use('/api/v1/groups', restrictToBot, groupRouter);
app.use('/api/v1/users', restrictToBot, userRouter);
app.use('/api/v1/events', restrictToBot, eventRouter);
app.use('/api/v1/alerts', restrictToBot, alertRouter);

// for all undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
});

app.use(globalErrorHandler);

module.exports = app;


/*
CONFIG 
-show config cmd
EVENTS
- validate events (only 3 events per day)
- validate events (no 2 events with the same datetime)
- edit history (logs)

MEMBERS
- sorting lists
- edit history (logs)

GROUPS
- max group size
- edit history (logs)

make exit not case sensitive
??? group show members [name]
more descriptive error messages
*/