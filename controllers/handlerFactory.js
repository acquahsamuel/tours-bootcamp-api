const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

/**
 * @desc           Create a tour
 * @routes         DELETE api/v1/tours
 * @access         Public
 *
 */
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc
      }
    });
  });

/**
 * @desc           Delete a tour
 * @routes         DELETE api/v1/tours
 * @access         Public
 *
 */

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404));
    }
    res.status(200).json({ message: "success", data: {} });
  });

/**
 * @desc           Delete a tour
 * @routes         DELETE api/v1/tours
 * @access         Public
 *
 */
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc
      }
    });
  });

/**
 * @desc           Delete a tour
 * @routes         DELETE api/v1/tours
 * @access         Public
 *
 */
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError(`No documents found with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        doc
      }
    });
  });



/**
 * @desc           Delete a tour
 * @routes         DELETE api/v1/tours
 * @access         Public
 *
 */
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
   /**Allow for nested GET view on tours */
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };


    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    // Send Response
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
