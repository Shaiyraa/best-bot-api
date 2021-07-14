const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.ObjectId,
    ref: "Event",
    required: [true, "Provide event."]
  },
  type: {
    type: String,
    required: [true, "Provide type."]
  },
  date: {
    type: Date,
    required: [true, "Provide date."]
  }
});

alertSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'event',
    select: 'messageId date alerts active guild'
  });

  next();
});

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;