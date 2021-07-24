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
QUICK SETUP TODO:
- group edit [name] [param] [value]

EVENTS
- edit history (logs)

MEMBERS
- sorting lists
- edit history (logs)

GROUPS
- display ppl in a group with average ap/aap/dp
- count of classes in a group
- edit history (logs)

FOR ALISH: ==========
logs:
- logs of progress (exact values changed on last update)

stats:
- ap/aap/dp + gs per class
- ap/aap/dp + gs per guild
- ap/aap/dp + gs per group
- ap/aap/dp + gs per event
- count of classes
- count of classes on each event
- list and count of ppl below avg gs/ap/aap/dp
====================

OTHER IDEAS AND THOUGHTS:
??? group show members [name]
more descriptive error messages
on ?profile create check if there is a disabled profile, if yes, display it and ask if user wants to retrieve it

maybe make the function recursive if recursive = true, then we can reuse validators




?stats base [opt: platoon]
CLASSES:
VALK 9
SHAI 4
SORC 4
WIZARD 5

AVG GS  456
AVG AAP 334
AVG AP  454
AVG DP  453

PEOPLE BELOW AVERAGE GS (4)
[]
PEOPLE BELOW AVERAGE AAP (2)
[]
PEOPLE BELOW AVERAGE AP (3)
[]
PEOPLE BELOW AVERAGE DP (2)
[]

?stats class [opt: platoon]
CLASS     COUNT     AVG AP    AVG AAP   AVG DP    AVG GS
asdads      3         234       234       234       466

?event list
  NEW ICON - STATS

  AVG GS  456
  AVG AAP 334
  AVG AP  454
  AVG DP  453

  YES: 45
  NO: 23
  UNDECIDED (3):
  []

*/