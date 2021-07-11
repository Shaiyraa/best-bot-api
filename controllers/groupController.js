const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Group = require('../models/groupModel');
const User = require('../models/userModel');

exports.createGroup = catchAsync(async (req, res, next) => {
  if (!req.body.guildId) req.body.guildId = req.params.id
  const { guildId, name, maxCount } = req.body

  const newGroup = await Group.create({
    guild: guildId,
    name,
    maxCount
  })

  res.status(201).json({
    status: "success",
    data: {
      group: newGroup
    }
  })
})

exports.assignGroup = catchAsync(async (req, res, next) => {
  const groupId = req.params.id;
  const { userId } = req.body;

  // find group
  const group = await Group.findById(groupId);
  if (!group) return next(new AppError("This group doesn't exist", 404));
  console.log(group)
  // find user
  const user = await User.findById(userId);
  if (!user) return next(new AppError("This user doesn't exist", 404));
  console.log(user)

  // compare guilds
  if (!group.guild._id.equals(user.guild._id)) return next(new AppError("Cannot assign this group to this user", 403))

  // update group
  await User.updateOne({ _id: user._id }, { group: group._id }, { new: true, runValidators: true })

  res.status(201).json({
    status: "success",
    data: {
      user
    }
  })
})