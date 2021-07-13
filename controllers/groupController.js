const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Group = require('../models/groupModel');
const User = require('../models/userModel');

exports.createGroup = catchAsync(async (req, res, next) => {
  if (!req.body.guildId) req.body.guildId = req.params.id
  const { guildId, name, maxCount } = req.body

  const exisitng = await Group.findOne({ guild: guildId, name: name.toUpperCase() })   // TODO: get it done with indexing
  if (exisitng) return next(new AppError("A group with this name already exists.", 403));

  const newGroup = await Group.create({
    guild: guildId,
    name: name.toUpperCase(),
    maxCount
  })

  res.status(201).json({
    status: "success",
    data: {
      group: newGroup
    }
  })
})

exports.deleteGroup = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Group.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    data: null
  });
})

exports.assignOne = catchAsync(async (req, res, next) => {
  const groupId = req.params.id;
  const { userFamilyName } = req.body;

  // find group
  const group = await Group.findById(groupId);
  if (!group) return next(new AppError("This group doesn't exist", 404));

  // update user
  const user = await User.updateOne({ familyName: userFamilyName, guild: group.guild }, { group: group._id }, { new: true, runValidators: true })
  if (!user) return next(new AppError("There is no user.", 404));

  res.status(201).json({
    status: "success",
    data: {
      user
    }
  })
})

exports.assignMany = catchAsync(async (req, res, next) => {
  const groupId = req.params.id;
  const { familyNames } = req.body;

  // find group
  const group = await Group.findById(groupId);
  if (!group) return next(new AppError("This group doesn't exist", 404));
  console.log(familyNames)
  // update users
  const users = await User.updateMany({ familyName: { $in: familyNames }, guild: group.guild }, { group: group._id }, { new: true, runValidators: true });

  res.status(201).json({
    status: "success",
    data: {
      users
    }
  })
})