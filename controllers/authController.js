const crypto = require("crypto");
const {promisify} = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

const signToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === "production") 
        cookieOptions.secure = true;
    
    res.cookie("jwt", token, cookieOptions);

    /**Remove password from output */
    user.password = undefined;

    res.status(statusCode).json({status: "success", token, data: {
            user
        }});
};

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    createSendToken(newUser, 201, res);
});

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError("Please provide email and password!", 400));
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({email}).select("+password");

    if (! user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    /**Every fine send Ok */
    createSendToken(user, 200, res);
});

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.protect = catchAsync(async (req, res, next) => { /**Getting token and check if it exist */
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (! token) {
        return next(new AppError(`You are not logged in. Please login to get access`, 401));
    }

    /**Verification token Validate token */
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    /**Check if user still exist  */
    const currentUser = await User.findById(decoded.id);
    if (! currentUser) {
        return next(new AppError("The user belonging to this token does no longer exist", 401));
    }

    /**If user changed password after JWT token was issued (iat = createdAt) */
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError("User recently changed password! Please log in again", 401));
    }

    req.user = currentUser;
    next();
});

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public (Only for render pages)
 */

exports.isLoggedIn = catchAsync(async (req, res, next) => { /**Getting token and check if it exist */
    if (req.cookies.jwt) {
        
        /**Verification token Validate token */
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        /**Check if user still exist  */
        const currentUser = await User.findById(decoded.id);
        if (! currentUser) {
            return next();
        }

        /**If user changed password after JWT token was issued (iat = createdAt) */
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next();
        }

        res.locals.user = currentUser;
        return next();
    }
    next();
});

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.restrictTo = (...roles) => { /**roles is an array ['admin' ,'lead-guide'] */
    return(req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403));
        }
        next();
    };
};

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if (! user) {
        return next(new AppError("There is no user with email address", 404));
    }

    /**Generate random */
    const resetToken = user.createPasswordResetToken();
    // Removes all run validators before saving
    await user.save({validateBeforeSave: false});

    /**Send Email */
    const resetURL = `${
        req.protocol
    }://${
        req.get("host")
    }/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new passowrd and password Confirm to ${resetURL}.\n If you didn't forget your passowrd, please ignore this`;

    try {
        await sendEmail({email: user.email, subject: "Your password reset token (valid for 10 min)", message});

        res.status(200).json({status: "success", message: "Token sent to email!"});
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError("There was an error sending the email. Try again later!"), 500);
    }
});

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gte: Date.now()
        }
    });

    if (! user) {
        return next(new AppError(`Token is invalid or has expired`, 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
});

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError("Your current password is wrong", 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);
});
