const mongoose = require('mongoose');
const validator = require('validator');

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
        minlength : 5,
        maxlength : 30,
        required: [true, 'Please Confirm  password']
    }

})

module.exports = mongoose.model('Users' ,userSchema, )