const mongoose = require('mongoose');



const guildSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "Provide discord guild ID."]
  },
  memberRole: {
    type: String,
    required: [true, "Provide memberRole name."]
  },
  officerRole: {
    type: String,
    required: [true, "Provide officerRole name."]
  },
  announcementsChannel: {
    type: String,
    required: [true, "Provide announcementsChannel name."]
  },
  remindersChannel: {
    type: String,
    required: [true, "Provide remindersChannel name."]
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

guildSchema.virtual('groups', {
  ref: 'Group',
  foreignField: 'guild', // where is the value kept on group doc
  localField: '_id' // in what field the same value is stored in guild doc
});

guildSchema.pre(/^find/, function (next) {
  this.populate({
    path: "groups",
    select: "_id name maxCount"
  });

  next();
});

const Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;