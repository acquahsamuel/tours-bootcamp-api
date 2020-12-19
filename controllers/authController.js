const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const sendEmail = require('./../utils/email');


/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public 
 */


const signToken = id => {
  return jwt.sign(
    {
      id
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
}


/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public 
 */


exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body)

  const token = signToken(newUser._id)

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  })
})


/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public 
 */


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400))
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401))
  }

  /**Every fine send Ok */
  const token = signToken(user._id)

  res.status(200).json({ status: 'success', token })
})



/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public 
 */


exports.protect = catchAsync(async (req, res, next) => {
  /**Getting token and check if it exist */
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(
      new AppError(`You are not logged in. Please login to get access`, 401)
    )
  }


  /**Verification token Validate token */
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  
  /**Check if user still exist  */
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    )
  }

  /**If user changed password after JWT token was issued (iat = createdAt) */
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    )
  }

  req.user = currentUser
  next()
})



/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public 
 */


exports.restrictTo = (...roles) => {
  /**roles is an array ['admin' ,'lead-guide'] */
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      )
    }
    next()
  }
}


/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public 
 */


exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new AppError('There is no user with email address', 404))
  }

  /**Generate randome */
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  /**Send Email */
  const resetURL =  `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new passowrd and password Confirm to ${resetURL}.\n If you didn't forget your passowrd, please ignore this`;

  try {
    await sendEmail({
      email : user.email,
      subject :`You password reset token (valid for 10min)`,
      message
    })
  
    res.status(200),json({
      status : 'success',
      message : 'Token sent to email!'
    })
  } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave : false});

      return next(new AppError('There was an error sending the email. Try again later' , 500));
  }

  // next()
})

exports.resetPassword = (req, res, next) => {}
