const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "A tour must have a review cannot be empty"]
    },
    rating: {
      type: Number,
      required: [true, "A tour must have a rating"],
      min: [1, "A rating must be above 1.0"],
      max: [5, "A rating must be below 5.0"]
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."]
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."]
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: "user",
    select: "name photo"
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { avg: "rating" }
      }
    }
  ]);

  console.log(stats);
};



reviewSchema.pre('save' , function(next){
  this.constructor().calcAverageRatings(this.tour)
  next();
})


module.exports = mongoose.model("Review", reviewSchema);
