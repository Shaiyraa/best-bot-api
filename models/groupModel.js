const mongoose = require('mongoose');


const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    validate: {
      validator: function (value) {
        return /^[a-zA-Z0-9_]{0,18}$/g.test(value);
      },
      message: props => `${props.value} is not a valid group name!`
    },
    required: [true, 'User phone number required']
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