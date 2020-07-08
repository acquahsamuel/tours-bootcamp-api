const mongoose = require('mongoose')

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty']
    },

    ratingsAverage: {
      type: Number,
      default: 4.5
    },

    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },

    priceDiscount: Number,

    summary: {
      type: String,
      trim: true,
      require: [true, 'A tour must have a description | Summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

tourSchema.virtual('durationWeek').get(function() {
  return this.duration / 7
})

// Pre middleware
//Document Middleware run before the save () and create not insertMany()
tourSchema.pre('save', function() {
  console.log(this)
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
