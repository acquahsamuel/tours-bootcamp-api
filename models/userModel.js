const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const userSchema  = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please tell us your name']
    },
    email : {
        type : String,
        unique  : true,
        lowercase : true,
        required : [true, 'Please tell us your email'],
        validate : [validator.isEmail, 'Please provide a valid email']
        
    },
    photo :  String,
    password : {
        type : String,
        minlength : 8,
        maxlength : 30,
        required: [true, 'Please provide a password']
    },
    passwordConfirm : {
        type : String,
        minlength : 8,
        maxlength : 30,
        required: [true, 'Please confirm your password'],
        validate : {
            /**This only works on Create, Save */
            validator : function(el){
                return el === this.password;
            },
            message : 'Password does not match'
        }
    }
})



userSchema.pre('save' , async function(next){
    if(!this.isModified('password')) return next();

    let salt = await bcrypt.genSalt(12);
    this.password  = await bcrypt.hash(this.password, salt);
    this.passwordConfirm = undefined;
    next()
})


module.exports = mongoose.model('User' ,userSchema)
