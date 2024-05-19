const app = require("./app");
// const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const connectDatabase = require("./config/database");

//Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting Down the Server due to Handling Uncaught Exception`);
    process.exit(1);
});

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "backend/config/config.env" });
}

//Connecting to Database
connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECERET
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

//Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting Down the Server due to Unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    });
});


// const express = require("express");
// const { createProxyMiddleware } = require("http-proxy-middleware");
// const cloudinary = require("cloudinary");
// const connectDatabase = require("./config/database");

// // Importing Express app from app.js
// const app = require("./app");

// //Handling Uncaught Exception
// process.on("uncaughtException", (err) => {
//     console.log(`Error: ${err.message}`);
//     console.log(`Shutting Down the Server due to Handling Uncaught Exception`);
//     process.exit(1);
// });

// // Config
// if (process.env.NODE_ENV !== "production") {
//     require("dotenv").config({ path: "backend/config/config.env" });
// }

// //Connecting to Database
// connectDatabase();

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Proxy middleware
// app.use("/api", createProxyMiddleware({
//     target: "http://localhost:4000", // Change this to the correct target URL
//     changeOrigin: true, // Needed for virtual hosted sites
//     secure: false, // Ignore certificate errors, might need to be changed in production
// }));

// const server = app.listen(process.env.PORT, () => {
//     console.log(`Server is working on http://localhost:${process.env.PORT}`);
// });

// //Unhandled Promise Rejection
// process.on("unhandledRejection", (err) => {
//     console.log(`Error: ${err.message}`);
//     console.log(`Shutting Down the Server due to Unhandled Promise Rejection`);

//     server.close(() => {
//         process.exit(1);
//     });
// });
