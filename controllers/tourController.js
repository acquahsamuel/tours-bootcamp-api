const Tour = require('./../models/tourModel')
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')


/**
 * @desc            Get all tours
 * @route           GET /api/v1/tours
 * @access          Public 
 */

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}


/**
 * @desc           Get all tours
 * @routes         GET api/v1/tours
 * @access         Public  
 */

exports.getAllTours =  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    const tours = await features.query

    // Send Response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    })
})




/**
 * @desc           Get all tours
 * @routes         GET api/v1/tours/:id
 * @access         Public 
 */

exports.getTour =  catchAsync(async (req, res,next) => {
    const tour = await Tour.findById(req.params.id)
    // Tour.findOne({ _id: req.params.id })

    if(!tour){
     return next(new AppError(`No tour found with that ID` , 404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    })
})


/**
 * @desc           Get all tours
 * @routes         POST api/v1/tours
 * @access         Public 
 */
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body)

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  })
})



/**
 * @desc           Update tour
 * @routes         PUT api/v1/tours/:id
 * @access         Public 
 * 
 */
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if(!tour){
    return next(new AppError(`No tour found with that ID` , 404))
   }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  })
})




/**
 * @desc           Delete a tour
 * @routes         DELETE api/v1/tours
 * @access         Public 
 * 
 */

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour =  await Tour.findByIdAndDelete(req.params.id)

    if(!tour){
      return next(new AppError(`No tour found with that ID` , 404))
     }

    res.status(204).json({ status: 'success', data: { } })
})



/**
 * @desc           Get tour Statictics
 * @routes         GET api/v1/tours/tours-stats
 * @access         Public 
 * 
 */

exports.getTourStats = catchAsync(async (req, res ,next) => { 
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
            $toUpper: '$difficulty'
          },
          numTours: {
            $sum: 1
          },
          numRatings: {
            $sum: '$ratingsQuantity'
          },
          avgRating: {
            $avg: '$ratingsAverage'
          },
          avgPrice: {
            $avg: '$price'
          },
          minPrice: {
            $min: '$price'
          },
          maxPrice: {
            $max: '$price'
          }
        }
      },
      {
        $sort: {
          avgPrice: 1
        }
      }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    })
})



/**
 * @desc           Get tours monthly-plan
 * @routes         GET api/v1/tours/monthly-plan/2021
 * @access         Public 
 * 
 */

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1 // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
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
            $month: '$startDates'
          },
          numTourStarts: {
            $sum: 1
          },
          tours: {
            $push: '$name'
          }
        }
      },
      {
        $addFields: {
          month: '$_id'
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
    ])

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    })
})
