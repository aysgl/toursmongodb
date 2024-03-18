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
const { protect } = require("../controllers/authController");

const router = express.Router();

router.route("/top-five-best").get(aliasTopTours, getTours);

router.route("/tour-stats").get(getTourStats);

router.route("/montly-plan/:year").get(getMontlyPlan);

router.route("/").get(protect, getTours).post(postTour);

router.route("/:id").get(getTour).delete(deleteTour).patch(patchTour);

module.exports = router;
