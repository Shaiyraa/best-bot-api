const mongoose = require('mongoose');

const userChangeSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now()
  },
  changedField: {
    type: String,
    enum: ["ap", "aap", "dp"],
    required: [true, "Provide changed field."]
  },
  oldValue: {
    type: Number,
    required: [true, "Provide changed field old value."]
  },
  newValue: {
    type: Number,
    required: [true, "Provide changed field new value."]
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }
})

const UserChange = mongoose.model('UserChange', userChangeSchema);

module.exports = UserChange;
