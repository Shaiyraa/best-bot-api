const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Group = require('../models/groupModel');
const User = require('../models/userModel');

// api/v1/guilds/2324524/groups/2342342
exports.getGroup = catchAsync(async (req, res, next) => {
  if (!req.body.guildId) req.body.guildId = req.params.guildId;
  const groupId = req.params.groupId;

  const group = await Group.findOne({ guild: req.body.guildId, _id: groupId});
  if(!group) return next(new AppError("Group doesn't exist.", 404));

  res.status(200).json({
    status: "success",
    data: {
      group
    }
  });
})

exports.createGroup = catchAsync(async (req, res, next) => {
  if (!req.body.guildId) req.body.guildId = req.params.guildId;
  const { guildId, name, maxCount } = req.body;

  const exisitng = await Group.findOne({ guild: guildId, name: name.toUpperCase() })   // TODO: get it done with indexing
  if (exisitng) return next(new AppError("A group with this name already exists.", 403));

  const newGroup = await Group.create({
    guild: guildId,
    name: name.toUpperCase(),
    maxCount
  });

  res.status(201).json({
    status: "success",
    data: {
      group: newGroup
    }
  });
});

exports.getAllGroups = catchAsync(async (req, res, next) => {
  let queryStr = JSON.stringify(req.query);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  let query = Group.find();
  query.find(JSON.parse(queryStr));

  const groups = await query;

  res.status(200).json({
    status: "success",
    results: groups.length,
    data: {
      groups
    }
  });
});

exports.updateGroup = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let { _id, guild, ...otherProps } = req.query;

  const group = await Group.findByIdAndUpdate(id, otherProps, {
    new: true,
    runValidators: true
  });

  if (!group) return next(new AppError("No group found", 404));

  res.status(201).json({
    status: "success",
    data: {
      group
    }
  });
});

exports.deleteGroup = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Group.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.assignOne = catchAsync(async (req, res, next) => {
  const groupId = req.params.id;
  const { userFamilyName } = req.body;

  // find group
  const group = await Group.findById(groupId);
  if (!group) return next(new AppError("This group doesn't exist", 404));

  // update user
  const user = await User.findOne({ familyName: userFamilyName, guild: group.guild })
  console.log(user)
  if (!user) return next(new AppError("There is no user.", 404));
  const newUser = await User.updateOne({ _id: user._id, guild: group.guild }, { group: group._id }, { new: true, runValidators: true })

  console.log(newUser)
  res.status(201).json({
    status: "success",
    data: {
      newUser
    }
  });
});

exports.assignMany = catchAsync(async (req, res, next) => {
  const groupId = req.params.id;
  const { familyNames } = req.body;

  // find group
  const group = await Group.findById(groupId);
  if (!group) return next(new AppError("This group doesn't exist", 404));

  // update users
  const users = await User.updateMany({ familyName: { $in: familyNames }, guild: group.guild }, { group: group._id }, { new: true, runValidators: true });

  res.status(201).json({
    status: "success",
    data: {
      users
    }
  });
});