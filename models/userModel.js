const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Please tell us your email'],
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },

  password: {
    type: String,
    minlength: 8,
    maxlength: 30,
    required: [true, 'Please provide a password'],
    select: false
  },
  passwordConfirm: {
    type: String,
    minlength: 8,
    maxlength: 30,
    required: [true, 'Please confirm your password'],
    validate: {
      /**This only works on Create, Save compare [password1 === password2] */
      validator: function (el) {
        return el === this.password
      },
      message: 'Password does not match'
    }
  },

  passwordChangedAt: Date
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  let salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  this.passwordConfirm = undefined
  next()
})

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )
    return JWTTimestamp < changedTimestamp
  }
  return false
}

module.exports = mongoose.model('User', userSchema)
