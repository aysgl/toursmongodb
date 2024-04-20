const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handleFactory");

exports.getAllReviews = getAll(Review);

exports.getReview = getOne(Review);

exports.setRefIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.createReview = createOne(Review);

exports.deleteReview = deleteOne(Review);

exports.updateReview = updateOne(Review);
