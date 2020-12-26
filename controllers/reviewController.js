const Review = require("./../models/reviewModel");
const factory = require("./handlerFactory");
//const catchAsync = require("../utils/catchAsync");


/**
 * @desc            Create all review
 * @route           GET /api/v1/tours
 * @access          Public
 */
exports.getAllReviews = factory.getAll(Review);


/**
 * @desc            Create all review
 * @route           GET /api/v1/tours
 * @access          Public
 */
exports.getReview = factory.getOne(Review);


/**
 * @desc            Create all review
 * @route           GET /api/v1/tours
 * @access          Public [Middlewares]
 */

exports.setTourUserIds = (req, res, next) => {
  /**Nested Routes (Middleware here) */
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

/**
 * @desc            Create all review
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.createReview = factory.createOne(Review);

/**
 * @desc            Create all review
 * @route           GET /api/v1/tours
 * @access          Public
 */
exports.updateReview = factory.updateOne(Review);

/**
 * @desc            Create all review
 * @route           GET /api/v1/tours
 * @access          Public
 */
exports.deleteReview = factory.deleteOne(Review);
