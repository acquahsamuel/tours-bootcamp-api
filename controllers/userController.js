const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");

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
 * @route           GET /api/v1/users/me
 * @access          Public
 */

 exports.getMe = (req, res , next) =>{
   req.params.id = req.user.id;
   next();
 }


/**
 * @desc            Get all tours
 * @route           PATCH /api/v1/users/me
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

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(201).json({
    status: "success",
    data: {}
  });
});



/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.getAllUsers = factory.getAll(User);


/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */
exports.getUser = factory.getOne(User);

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use signup instead"
  });
};

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */
exports.updateUser = factory.updateOne(User);

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */
exports.deleteUser = factory.deleteOne(User);
