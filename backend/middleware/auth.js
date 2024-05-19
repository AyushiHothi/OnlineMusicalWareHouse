const ErrorHendler = require("../utils/errorhander");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    // debugger;
    const { token } = req.cookies;
    
    if(!token){
        return next(new ErrorHendler("Please Login to access this Resource", 401));
    }
    const decodedData  = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData .id);

    next();
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(
                new ErrorHendler(`Role: ${req.user.role} is not allowed to access this Resource`,403)
            );
        }
        next();
    };
};