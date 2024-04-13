const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const { deleteOne, updateOne, getOne, getAll } = require("./handleFactory");

exports.getAllReviews = getAll(Review);

exports.getReview = getOne(Review);

exports.createReview = async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.uuser) req.body.user = req.params.id;

  createOne(Review);
};

exports.deleteReview = deleteOne(Review);

exports.updateReview = updateOne(Review);
