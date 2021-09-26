const multer = require('multer');
const sharp = require('sharp');
const factory = require("./handlerFactory");
const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");


/**
 * @desc            Image upload config
 * @route           GET /middleware/
 * @access          Private
 */


// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-767633abc76dba-33323.jpeg 
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

//check if the file type is image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');



/**
 * @desc            Resizing user photo
 * @route           GET  middleware
 * @access          Public
 */

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  //resize = width && height
  sharp(req.file.buffer).resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/user/${req.file.filename}`);
    next();
};


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

exports.getMe = (req, res, next) => {
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
  if (req.file) filteredBody.photo = req.file.filename;

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
