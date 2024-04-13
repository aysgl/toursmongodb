const express = require("express");
const reviewController = require("../controllers/reviewController");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

module.exports = router;
