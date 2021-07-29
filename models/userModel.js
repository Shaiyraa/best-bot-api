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
  gearscore: {
    type: Number
  },
  characterClass: {
    type: String,
    required: [true, "Provide class."],
    enum: ["archer", "berserker", "dark knight", "guardian", "hashashin", "kunoichi", "lahn", "maehwa", "musa", "mystic", "ninja", "nova", "ranger", "sage", "shai", "sorceress", "striker", "tamer", "valkyrie", "warrior", "witch", "wizard", "corsair"]
  },
  stance: {
    type: String,
    required: [true, "Provide stance."],
    enum: ["awakening", "succession"]
  },
  level: {
    type: Number,
    required: [true, "Provide level."]
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
  proof: String,
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date
  },
  deletedAt: Date,
  deletedBy: {
    type: String,
    enum: ["user", "admin", "bot"]
  },
  lastUpdate: {
    type: Date,
    default: Date.now()
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

// userSchema.virtual('gearscore').get(function () {
//   if (this.stance === "succession") {
//     return this.regularAp + this.dp;
//   } else {
//     return Math.floor((this.regularAp + this.awakeningAp) / 2 + this.dp);
//   }
// });

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

userSchema.pre(/^find/, function (next) {
  // this points to the query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre(/^save/, async function (next) {
  if (this.active === false) {
    if (this.characterClass === "shai") {
      this.stance = "awakening";
    };
  };

  next();
});

userSchema.pre(/^save/, async function (next) {
  if (this.active === false) {
    if (this.isModified('regularAp') || this.isModified('awakeningAp') || this.isModified('dp')) {
      this.lastUpdate = Date.now();
    };

    console.log("counting gs -save")
    this.gearscore = Math.floor((this.regularAp + this.awakeningAp) / 2 + this.dp);
    console.log(this.gearscore)

    // if (this.stance === "succession") {
    //   this.gearscore = this.regularAp + this.dp;
    // } else {
    //   this.gearscore = Math.floor((this.regularAp + this.awakeningAp) / 2 + this.dp);
    // };
  }

  next();
});


userSchema.post("findOneAndUpdate", async function (result, next) {
  if (result.active !== false) {
    if (result.characterClass === "shai") {
      result.stance = "awakening";
    };

    await result.save();
  };

  next();
});

userSchema.post("findOneAndUpdate", async function (result, next) {
  if (result.active !== false) {
    if (result.isModified('regularAp') || result.isModified('awakeningAp') || result.isModified('dp')) {
      result.lastUpdate = Date.now();
    };

    console.log("counting gs -findoneandupdate")
    result.gearscore = Math.floor((result.regularAp + result.awakeningAp) / 2 + result.dp);
    console.log(result.gearscore)

    // if (result.stance === "succession") {
    //   result.gearscore = result.regularAp + result.dp;
    // } else {
    //   result.gearscore = Math.floor((result.regularAp + result.awakeningAp) / 2 + result.dp);
    // };

    await result.save();
  };

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;