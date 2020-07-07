const Tour = require('./../models/tourModel')

// Create Tour (single Tour)
class APIFeatures {
  constructor(query, queryString) {
    // query
    this.query = query

    // req.query
    this.queryString = queryString
  }

  filter() {
    const queryObj = {
      ...this.queryString
    }
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach(el => delete queryObj[el])

    // 1B Advanced Filtering
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    console.log(JSON.parse(queryStr))

    this.query = this.query.find(JSON.parse(queryStr))

    return this
  }

  // 2 Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ')
      console.log(sortBy)
      this.query = this.query.sort(sortBy)
    } else {
      // (-) including
      this.query = this.query.sort('-createdAt')
    }

    return this
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      // (-V) Excluding
      this.query = this.query.select('-__v')
    }
    return this
  }

  paginate() {
    // 4) Pagination
    // Convert string to a number trick
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 100
    const skip = (page - 1) * limit

    this.query = this.query.skip(skip).limit(limit)

    return this
  }
}

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    })
  } catch (err) {
    res.status(400).json({ status: 'failed', message: 'Invalid data sent' })
  }
}

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}

// Get all Tours
exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    const tours = await features.query

    res.status(200).json({
      status: 'succcess',
      results: tours.length,
      data: {
        tours
      }
    })
  } catch (err) {
    res
      .status(400)
      .json({ status: 'failed', message: `Oops something happend ${err}` })
  }
}

// Get tour (By ID)
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
    // Tour.findOne({_id : req.params.id})
    res.status(200).json({
      status: 'succcess',
      data: {
        tour
      }
    })
  } catch (err) {
    res
      .status(400)
      .json({ status: 'failed', message: `Oops something happend ${err}` })
  }
}

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    res.status(200).json({
      status: 'succcess',
      data: {
        tour
      }
    })
  } catch (err) {
    res
      .status(400)
      .json({ status: 'failed', message: `Oops something happend ${err}` })
  }
}

// Delete tour
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id)
    res.status(204).json({ status: 'success', data: null })
  } catch (err) {
    res
      .status(400)
      .json({ status: 'failed', message: `Oop something happend ${err}` })
  }
}
