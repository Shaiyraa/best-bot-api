const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["nodewar", "siege", "event"],
    default: "nodewar"
  },
  date: {
    type: Date,
    required: [true, "Provide event date."]
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
    type: String,
    enum: ["yes", "no"],
    default: "no"
  },
  active: {
    type: Boolean,
    default: true
  },
  content: {
    type: String,
    default: "no description"
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
  guild: {
    type: mongoose.Schema.ObjectId,
    ref: "Guild"
  }
});

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
      path: 'guild',
      select: 'id announcementsChannel remindersChannel memberRole officerRole'
    })

  next()
})

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;