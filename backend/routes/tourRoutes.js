const express = require("express");
const {
  getTours,
  postTour,
  getTour,
  deleteTour,
  patchTour,
  aliasTopTours,
  getTourStats,
  getMontlyPlan,
} = require("../controllers/tourController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router
  .route("/top-five-best")
  .get(protect, restrictTo("admin"), aliasTopTours, getTours);

router.route("/tour-stats").get(protect, restrictTo("admin"), getTourStats);

router
  .route("/montly-plan/:year")
  .get(protect, restrictTo("admin"), getMontlyPlan);

router
  .route("/")
  .get(protect, restrictTo("user", "admin"), getTours)
  .post(postTour);

router
  .route("/:id")
  .get(getTour)
  .delete(protect, restrictTo("admin"), deleteTour)
  .patch(protect, restrictTo("user", "admin"), patchTour);

module.exports = router;
