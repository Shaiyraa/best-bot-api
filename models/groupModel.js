const mongoose = require('mongoose');


const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Provide a name."]
  },
  maxCount: {
    type: Number,
    default: 100
  },
  guild: {
    type: mongoose.Schema.ObjectId,
    ref: "Guild",
    required: [true, "Provide guild."]
  }
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;