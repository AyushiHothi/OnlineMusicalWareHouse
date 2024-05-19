const ErrorHendler = require("../utils/errorhander");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //Wrong Mongodb Id error
    if(err.name === "CastError") {
        const message = `Resource Not Found. Invalid: ${err.path}`;
        err = new ErrorHendler(message, 400);
    }

    //Mongoose duplicate key error
    if(err.code === 11000) {
        const message = `Duplicate ${ Object.keys(err.keyValue) } Entered`;
        err = new ErrorHendler(message, 400);
    }

    //Wrong JWT Token
    if(err.name === "JsonWebTokenError") {
        const message = `Json Web Token Invalid, try again`;
        err = new ErrorHendler(message, 400);
    }

    //JWT Expired Error
    if(err.name === "TokenExpiredError") {
        const message = `Json Web Token Expired, try again`;
        err = new ErrorHendler(message, 400);
    }

    res.status(err.statusCode).json({
        success:false,
        message: err.message,
    });
};