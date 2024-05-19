const Product = require("../models/productModel");
const ErrorHendler = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");

// //Create Product --- Admin
// exports.createProduct = catchAsyncErrors(async (req, res, next) => {
//     let images = [];

//     if (typeof req.body.images === "string") {
//         images.push(req.body.images);
//     } else {
//         images = req.body.images;
//     }

//     const imagesLinks = [];

//     for (let i = 0; i < images.length; i++) {
//         const result = await cloudinary.v2.uploader.upload(images[i], {
//             folder: "products",
//         });

//         imagesLinks.push({
//             public_id: result.public_id,
//             url: result.secure_url,
//         });
//     }

//     req.body.images = imagesLinks;
//     req.body.user = req.user.id;

//     const product = await Product.create(req.body);

//     res.status(201).json({
//         success: true,
//         product,
//     });
// });

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    // Extract stock value from request body
    const { name, description, price, stock, category } = req.body;

    // Include stock value in the product data
    const productData = {
        name,
        description,
        price,
        stock, // Include the stock value provided in the request body
        category,
        user: req.user.id
    };

    // Include images links in the product data
    productData.images = imagesLinks;

    // Create the product using the product data
    const product = await Product.create(productData);

    res.status(201).json({
        success: true,
        product,
    });
});


//GET All Products
// exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
//     // debugger;
//     const resultPerPage = 8;
//     const productsCount = await Product.countDocuments();

//     const apiFeature = new ApiFeatures(Product.find(), req.query)
//         .search()
//         .filter();

//     let products = await apiFeature.query;

//     let filteredProductsCount = products.length;

//     apiFeature.pagination(resultPerPage);

//     products = await apiFeature.query;

//     res.status(200).json({
//         success: true,
//         products,
//         productsCount,
//         resultPerPage,
//         filteredProductsCount,
//     });
// });

// GET All Products
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 8;
    let productsCount;
    let filteredProductsCount;

    const currentPage = parseInt(req.query.page) || 1; // Current page number
    const skip = resultPerPage * (currentPage - 1); // Calculate skip

    let query = {}; // Initialize filter query

    // Apply filters
    const { keyword, category, price, ratings } = req.query;
    let filter = {};

    // Filter by keyword
    if (keyword) {
        filter = { ...filter, name: { $regex: keyword, $options: 'i' } };
    }

    // Filter by category
    if (category) {
        filter = { ...filter, category };
    }

    // Filter by price range
    if (price && price.length === 2) {
        filter = { ...filter, price: { $gte: price[0], $lte: price[1] } };
    }

    // Filter by ratings
    if (ratings && !isNaN(ratings)) {
        filter = { ...filter, ratings: { $gte: parseInt(ratings) } };
    }

    // Get total count before pagination
    productsCount = await Product.countDocuments(filter);

    // Pagination
    const apiFeatures = new ApiFeatures(Product.find(filter), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);

    // const products = await apiFeatures.query;
    // Get products with pagination
    const products = await Product.find(query)
        .skip(skip)
        .limit(resultPerPage);

    // Get filtered count after pagination
    filteredProductsCount = products.length;

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    });
});

//GET Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHendler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        product,
    });
});

//Update Product --- Admin

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHendler("Product Not Found", 404));
    }

    // Images Start Here
    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if (images !== undefined) {
        // Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product,
    });
});

//Delete Product

// exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {

//     const product = await Product.findById(req.params.id);

//     if (!product) {
//         return next(new ErrorHendler("Product Not Found", 404));
//     }

//     // Deleting Images From Cloudinary
//     for (let i = 0; i < product.images.length; i++) {
//         await cloudinary.v2.uploader.destroy(product.images[i].public_id);
//     }

//     await product.remove();

//     res.status(200).json({
//         success: true,
//         message: "Product Deleted Successfully"
//     });
// });

// Delete Product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        // if (!product) {
        //     return next(new ErrorHendler("Product Not Found", 404));
        // }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        await product.deleteOne({ _id: req.params.id });

        res.status(200).json({
            success: true,
            message: "Product Deleted Successfully"
        });
    } catch (error) {
        return next(new ErrorHendler(error.message, 400));
    }
});


//Ceate Review or Update The Review
// exports.createProductReview = catchAsyncErrors(async (req, res, next) => {

//     const { rating, comment, productId } = req.body;

//     const review = {
//         user: req.user._id,
//         name: req.user.name,
//         rating: Number(rating),
//         comment,
//     };

//     try {
//         const product = await Product.findById(productId);

//         const isReviewed = product.reviews.find(
//             (rev) => rev.user.toString() === req.user._id.toString()
//         );

//         if (isReviewed) {
//             product.reviews.forEach((rev) => {
//                 if (rev.user.toString() === req.user._id.toString()) {
//                     rev.rating = rating;
//                     rev.comment = comment;
//                 }
//             });
//         } else {
//             product.reviews.push(review);
//             product.numberOfReviews = product.reviews.length;
//         }

//         let avg = 0;
//         product.reviews.forEach((rev) => {
//             avg += rev.rating;
//         });
//         product.ratings = avg / product.reviews.length;

//         await product.save({ validateBeforeSave: false });

//         res.status(200).json({
//             success: true,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'An error occurred while processing your request.',
//         });
//     }
// });


// Create New Review or Update the review
// exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
//     const { rating, comment, productId } = req.body;

//     const review = {
//         user: req.user._id,
//         name: req.user.name,
//         rating: Number(rating),
//         comment,
//     };

//     const product = await Product.findById(productId);

//     const isReviewed = product.reviews.find(
//         (rev) => rev.user.toString() === req.user._id.toString()
//     );

//     if (isReviewed) {
//         product.reviews.forEach((rev) => {
//             if (rev.user.toString() === req.user._id.toString())
//                 (rev.rating = rating), (rev.comment = comment);
//         });
//     } else {
//         product.reviews.push(review);
//         product.numOfReviews = product.reviews.length;
//     }

//     let avg = 0;

//     product.reviews.forEach((rev) => {
//         avg += rev.rating;
//     });

//     product.ratings = avg / product.reviews.length;

//     await product.save({ validateBeforeSave: false });

//     res.status(200).json({
//         success: true,
//     });
// });

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    // Check if the user has already reviewed the product
    const existingReviewIndex = product.reviews.findIndex(rev => rev.user.toString() === req.user._id.toString());

    if (existingReviewIndex !== -1) {
        // If the user has already reviewed the product, update the existing review
        product.reviews[existingReviewIndex] = review;
    } else {
        // If the user hasn't reviewed the product, add the new review
        product.reviews.push(review);
    }

    // Update numOfReviews
    product.numOfReviews = product.reviews.length;

    // Calculate average rating
    const totalRating = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    product.ratings = totalRating / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});


// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHendler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHendler("Product not found", 404));
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
    });
});