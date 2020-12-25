const Review = require("./../models/reviewModel");
const catchAsync = require("../utils/catchAsync");

/**
 * @desc            Create all review
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.createReview = catchAsync(async (req, res, next) => {
  /**Nested Routes */
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const review = await Review.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      review: review
    }
  });
});

/**
 * @desc            Create all review
 * @route           GET /api/v1/tours
 * @access          Public
 */
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews
    }
  });
});
