const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handleFactory");

exports.aliasTopTours = async (req, res, next) => {
  // console.log(req.query.fields);
  req.query.sort = "ratingsAverage";
  req.query.fields = "-_id,-startDates,-images";
  // req.query.limit = 5;
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

exports.getTours = getAll(Tour);

exports.getTour = getOne(Tour, "reviews");

exports.postTour = createOne(Tour);

exports.patchTour = updateOne(Tour);

exports.deleteTour = deleteOne(Tour);

exports.getToursWithin = async (req, res, next) => {
  const { latlng, distance, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit == "km" ? distance / 6378.1 : distance / 3963.2;

  if (!lat || !lng)
    return next(new AppError("Please enter latitude and longitude"));

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lat, lng], radius] } },
  });

  res.status(200).json({
    message: "Success!",
    tours,
  });
};

exports.getToursDistance = async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  if (!lat || !lng)
    return next(new AppError("Please enter latitude and longitude"));

  const multipler = unit == "mi" ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [+lat, +lng] },
        distanceField: "distance",
        distanceMultiplier: multipler,
      },
    },
    // {
    //   $project: {
    //     name: 1,
    //     distance: 1,
    //   },
    // },
  ]);

  res.status(200).json({
    message: "Success!",
    data: distances,
    unit,
  });
};
