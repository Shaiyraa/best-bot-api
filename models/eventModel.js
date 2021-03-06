const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["nodewar", "siege", "guildevent"],
    default: "nodewar"
  },
  date: {
    type: Date,
    required: [true, "Provide event date."]
  },
  maxCount: {
    type: Number,
    default: 100
  },
  messageChannelId: {
    type: String,
    required: [true, "Provide message channel ID."]
  },
  messageId: {
    type: String,
    required: [true, "Provide message ID."]
  },
  mandatory: {
    type: Boolean,
    required: [true, "Provide mandatory."]
  },
  alerts: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  content: {
    type: String,
    default: "No description"
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  yesMembers: [{
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }],
  noMembers: [{
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }],
  undecidedMembers: [{
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }],
  waitlistedMembers: [{
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }],
  guild: {
    type: mongoose.Schema.ObjectId,
    ref: "Guild"
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

eventSchema.virtual('hour').get(function () {
  let minutes = this.date.getMinutes();
  if (minutes < 10) minutes = `0${minutes}`;

  return `${this.date.getHours()}:${minutes}`;
})

eventSchema.pre(/^find/, function (next) {
  // this points to the query
  this.find({ active: { $ne: false } });

  next();
})

eventSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'undecidedMembers',
    populate: {
      path: "",
      model: 'User'
    }
  })
    .populate({
      path: 'yesMembers',
      populate: {
        path: "",
        model: 'User'
      }
    })
    .populate({
      path: 'noMembers',
      populate: {
        path: "",
        model: 'User'
      }
    })
    .populate({
      path: 'waitlistedMembers',
      populate: {
        path: "",
        model: 'User'
      }
    })
    .populate({
      path: 'guild',
      select: 'id remindersChannel memberRole officerRole groups'
    })

  next()
})

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;