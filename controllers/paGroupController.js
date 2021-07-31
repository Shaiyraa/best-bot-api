const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const PaGroup = require('../models/paGroupModel');
const User = require('../models/userModel');

exports.createPaGroup = catchAsync(async (req, res, next) => {
  if (!req.body.guildId) req.body.guildId = req.params.guildId;
  const { guildId, name, maxCount } = req.body;

  const exisitng = await PaGroup.findOne({ guild: guildId, name: name.toUpperCase() })   // TODO: get it done with indexing
  if (exisitng) return next(new AppError("A PA group with this name already exists.", 403));

  const newPaGroup = await PaGroup.create({
    guild: guildId,
    name: name.toUpperCase(),
    maxCount
  });

  res.status(201).json({
    status: "success",
    data: {
      paGroup: newPaGroup
    }
  });
});

// api/v1/guilds/2324524/pa-groups/2342342
exports.getPaGroup = catchAsync(async (req, res, next) => {
  if (!req.body.guildId) req.body.guildId = req.params.guildId;
  const paGroupId = req.params.paGroupId;

  const paGroup = await PaGroup.findOne({ guild: req.body.guildId, _id: paGroupId });
  if (!paGroup) return next(new AppError("No PA group found.", 404));

  res.status(200).json({
    status: "success",
    data: {
      paGroup
    }
  });
})

exports.getAllPaGroups = catchAsync(async (req, res, next) => {
  let queryStr = JSON.stringify(req.query);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  let query = PaGroup.find();
  query.find(JSON.parse(queryStr));

  const paGroups = await query;

  res.status(200).json({
    status: "success",
    results: paGroups.length,
    data: {
      paGroups
    }
  });
});

exports.updatePaGroup = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let { _id, guild, ...otherProps } = req.query;

  const paGroup = await PaGroup.findByIdAndUpdate(id, otherProps, {
    new: true,
    runValidators: true
  });

  if (!paGroup) return next(new AppError("No PA group found.", 404));

  res.status(201).json({
    status: "success",
    data: {
      paGroup
    }
  });
});

exports.deletePaGroup = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await PaGroup.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.assignOne = catchAsync(async (req, res, next) => {
  const paGroupId = req.params.id;
  const { userFamilyName } = req.body;

  // find group
  const paGroup = await PaGroup.findById(paGroupId);
  if (!paGroup) return next(new AppError("No PA group found.", 404));

  // update user
  const user = await User.findOne({ familyName: userFamilyName, guild: paGroup.guild })
  if (!user) return next(new AppError("No user found.", 404));
  const newUser = await User.updateOne({ _id: user._id, guild: paGroup.guild }, { paGroup: paGroup._id }, { new: true, runValidators: true })

  res.status(201).json({
    status: "success",
    data: {
      newUser
    }
  });
});

exports.assignMany = catchAsync(async (req, res, next) => {
  const paGroupId = req.params.id;
  const { familyNames } = req.body;

  // find group
  const paGroup = await PaGroup.findById(paGroupId);
  if (!paGroup) return next(new AppError("No PA group found.", 404));

  // update users
  await User.updateMany({ familyName: { $in: familyNames }, guild: paGroup.guild }, { paGroup: paGroup._id }, { new: true, runValidators: true }).catch(console.log);

  res.status(201).json({
    status: "success",
    data: null
  });
});

exports.removeOne = catchAsync(async (req, res, next) => {
  const { user, guild } = req.query;

  console.log("324")

  // update user
  const userDoc = await User.findOne({ familyName: user, guild });
  if (!userDoc) return next(new AppError("No user found.", 404));

  console.log("asd")
  userDoc.paGroup = null;
  console.log("dfg")

  await userDoc.save()
  console.log("hjk")

  res.status(201).json({
    status: "success",
    data: {
      userDoc
    }
  });
});