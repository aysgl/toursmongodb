const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");

exports.aliasTopTours = async (req, res, next) => {
  // console.log(req.query.fields);
  req.query.sort = "ratingsAverage";
  req.query.fields = "-_id,-startDates,-images";
  req.query.limit = 5;
  next();
};

exports.getTourStats = async (req, res, next) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.6 } },
      },
      {
        $group: {
          _id: "$difficulty",
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { price: 1 },
      },
      {
        $match: {
          minPrice: { $gte: 400 },
        },
      },
    ]);
    res.status(200).json({
      message: "success get tour stats",
      results: stats.length,
      data: stats,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

exports.getMontlyPlan = async (req, res, next) => {
  try {
    const year = Number(req.params.year);
    const tourplan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$startDates" },
            year: { $year: "$startDates" },
          },
          totalPrice: { $sum: "$price" },
          tourplan: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0,
          month: "$month",
        },
      },
      {
        $sort: {
          month: 1,
        },
      },
    ]);
    res.status(200).json({
      message: "success get monthly plan",
      results: tourplan.length,
      data: tourplan,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

exports.getTours = async (req, res, next) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .fields()
      .page();

    const tours = await features.query;

    res.status(200).json({
      message: "success get tours",
      results: tours.length,
      data: tours,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

exports.getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({ _id: req.params.id });
    res
      .status(200)
      .json({ message: "success get tour", results: tour.length, data: tour });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

exports.postTour = async (req, res, next) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ message: "success newTour", data: newTour });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

exports.patchTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ message: "success patch tour", data: tour });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: "success delete tour" });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
