const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public

 */

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users
    }
  });
});

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword ",
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async(req, res, next) =>{
  await User.findByIdAndUpdate(req.user.id, {active : false})

  res.status(201).json({
    status : 'success',
    data : {}
  })
})





/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError(`No user found with that ID`, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user
    }
  });
});



/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      user: user
    }
  });
});



/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError(`No tour found with that ID`, 404));
  }
  res.status(201).json({ status: "success", data: { user } });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError(`No user found with that ID`, 404));
  }
  res.status(200).json({ message: "success", data: {} });
});
