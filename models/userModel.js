const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"]
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "Please tell us your email"],
    validate: [validator.isEmail, "Please provide a valid email"]
  },
  photo: {
    type : String , 
    default : 'default.jpg'
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user"
  },
  password: {
    type: String,
    minlength: 8,
    maxlength: 30,
    required: [true, "Please provide a password"],
    select: false
  },
  passwordConfirm: {
    type: String,
    minlength: 8,
    maxlength: 30,
    required: [true, "Please confirm your password"],
    validate: {
      /**This only works on Create, Save compare [password1 === password2] */
      validator: function(el) {
        return el === this.password;
      },
      message: "Password does not match"
    }
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
 
  active : {
    type : Boolean,
    default : true,
    select : false
  }

});

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});


userSchema.pre(/^find/ , function(next){
  this.find({ active :  {$ne : false}});
  next();
});

userSchema.pre('save' , function(next){
  if(!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now();
  next();
})



// Match user entered password to hashed password in database
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * @default_code checking matched password
  userSchema.methods.correctPassword = async function (candidatePassword,userPassword) {
   return await bcrypt.compare(candidatePassword, userPassword)
  }
 */

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
