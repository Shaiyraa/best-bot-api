const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "Provide discord user ID."]
  },
  familyName: {
    type: String,
    required: [true, "Provide family name."]
  },
  regularAp: {
    type: Number,
    required: [true, "Provide regular AP."]
  },
  awakeningAp: {
    type: Number,
    required: [true, "Provide awakening AP."]
  },
  dp: {
    type: Number,
    required: [true, "Provide DP."]
  },
  characterClass: {
    type: String,
    required: [true, "Provide class."],
    enum: ["archer", "berserker", "dark knight", "guardian", "hashashin", "kunoichi", "lahn", "maehwa", "musa", "mystic", "ninja", "nova", "ranger", "sage", "shai", "sorceress", "striker", "tamer", "valkyrie", "warrior", "witch", "wizard"]
  },
  stance: {
    type: String,
    required: [true, "Provide stance."],
    enum: ["awakening", "succession"]
  },
  hp: {
    type: Number
  },
  eva: {
    type: Number
  },
  dr: {
    type: Number,

  },
  acc: {
    type: Number,
  },
  horse: {
    type: String,
    enum: ["tier 1", "tier 2", "tier 3", "tier 4", "tier 5", "tier 6", "tier 7", "tier 8", "pegasus", "doom", "unicorn", "donkey"]
  },
  private: {
    type: Boolean,
    default: false
  },
  group: {
    type: mongoose.Schema.ObjectId,
    ref: "Group"
  },
  guild: {
    type: mongoose.Schema.ObjectId,
    ref: "Guild",
    required: [true, "Provide guild."]
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('gearscore').get(function () {
  if (this.stance === "succession") {
    return this.regularAp + this.dp;
  } else {
    return Math.floor((this.regularAp + this.awakeningAp) / 2 + this.dp);
  }
});

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guild',
    select: 'id'
  }).populate({
    path: 'group',
    select: 'name'
  });

  next();
})

// userSchema.pre(/^find/, function (next) {
//   // this points to the query
//   this.find({ active: { $ne: false } });

//   next();
// })

const User = mongoose.model('User', userSchema);

module.exports = User;