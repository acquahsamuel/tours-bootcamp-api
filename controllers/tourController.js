const Tour = require("./../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");

/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public
 */

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

/**
 * @desc           Get all tours
 * @routes         GET api/v1/tours
 * @access         Public
 */

exports.getAllTours = factory.getAll(Tour);

/**
 * @desc           Get all tours
 * @routes         GET api/v1/tours/:id
 * @access         Public
 */

exports.getTour = factory.getOne(Tour, { path: "reviews" });

/**
 * @desc           Get all tours
 * @routes         POST api/v1/tours
 * @access         Public
 */
exports.createTour = factory.createOne(Tour);
/**
 * @desc           Update tour
 * @routes         PUT api/v1/tours/:id
 * @access         Public
 *
 */
exports.updateTour = factory.updateOne(Tour);

/**
 * @desc           Delete a tour
 * @routes         DELETE api/v1/tours
 * @access         Public
 *
 */

exports.deleteTour = factory.deleteOne(Tour);

/**
 * @desc           Get tour Statictics
 * @routes         GET api/v1/tours/tours-stats
 * @access         Public
 *
 */

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5
        }
      }
    },
    {
      $group: {
        _id: {
          $toUpper: "$difficulty"
        },
        numTours: {
          $sum: 1
        },
        numRatings: {
          $sum: "$ratingsQuantity"
        },
        avgRating: {
          $avg: "$ratingsAverage"
        },
        avgPrice: {
          $avg: "$price"
        },
        minPrice: {
          $min: "$price"
        },
        maxPrice: {
          $max: "$price"
        }
      }
    },
    {
      $sort: {
        avgPrice: 1
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats
    }
  });
});

/**
 * @desc           Get tours monthly-plan
 * @routes         GET api/v1/tours/monthly-plan/2021
 * @access         Public
 *
 */

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates"
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: {
          $month: "$startDates"
        },
        numTourStarts: {
          $sum: 1
        },
        tours: {
          $push: "$name"
        }
      }
    },
    {
      $addFields: {
        month: "$_id"
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numTourStarts: -1
      }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      plan
    }
  });
});

/**
 * @desc           Get tours monthly-plan
 * @routes         GET api/v1/tours/monthly-plan/2021
 * @access         Public
 *
 */

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError("Plese provide langititude in the format lat, lng.", 400)
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: tours
  });
});

/**
 * @desc           Get tours monthly-plan
 * @routes         GET api/v1/tours/monthly-plan/2021
 * @access         Public
 *
 */

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitutr and longitude in the format lat,lng.",
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: "distance",
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances
    }
  });
});
