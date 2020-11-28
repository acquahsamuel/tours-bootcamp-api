const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('./../utils/appError');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body)

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
      token
    }
  })
})



exports.login = (req,res , next) =>{
  const {email , password } =  req.body;

  /**Check if email and password exists */
  if(!email || !password){
    return next(new AppError('Please provide email and password!' , 400));
  }

  /**Check for vaild email and password */
  const user = User.findOne({email : email})



 /**Every fine send Ok */
  const token = '';
  res.status(200).json({
    status : 'success',
    token
  })
}