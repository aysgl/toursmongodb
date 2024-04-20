const fs = require("fs");
const mongoose = require("mongoose");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Review = require("../models/reviewModel");
require("dotenv").config();

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Mongoose db success");

    const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
    const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
    const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));

    if (process.argv.includes("--import")) {
      await Tour.create(tours, { validateBeforeSave: false });
      await User.create(users, { validateBeforeSave: false });
      await Review.create(reviews, { validateBeforeSave: false });
      console.log("Data import successful");
    } else if (process.argv.includes("--delete")) {
      await Tour.deleteMany();
      await User.deleteMany();
      await Review.deleteMany();
      console.log("Data deletion successful");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    process.exit();
  }
})();
