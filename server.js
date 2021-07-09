const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on("uncaughtException", (err) => {
  console.log("Uncaught exception. Shutting down.");
  console.log(err.name, err.message);

  process.exit(1);

});

dotenv.config({ path: "./config.env" });
const app = require('./app');

const db = process.env.MONGO_URI?.replace("<PASSWORD>", process.env.DB_PASSWORD) || "mongodb://test:test@localhost:27017/bestbot"

mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}).then(() => {
  console.log("Connection to database established");
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection. Shutting down.");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});


