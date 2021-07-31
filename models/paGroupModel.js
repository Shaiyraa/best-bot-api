const mongoose = require('mongoose');

const paGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    validate: {
      validator: function (value) {
        return /^[a-zA-Z0-9_]{0,18}$/g.test(value);
      },
      message: props => `${props.value} is not a valid PA group name!`
    },
    required: [true, 'Not a valid PA group name.']
  },
  maxCount: {
    type: Number,
    default: 20,
    min: 1,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  guild: {
    type: mongoose.Schema.ObjectId,
    ref: "Guild",
    required: [true, "Provide guild."]
  }
});

const PaGroup = mongoose.model('PaGroup', paGroupSchema);

module.exports = PaGroup;