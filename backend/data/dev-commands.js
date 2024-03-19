const fs = require("fs");
const mongoose = require("mongoose");
const Tour = require("../models/tourModel");
require("dotenv").config({ path: "../.env" });

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Mongoose db success"))
  .catch((err) => console.log(err));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));

const importData = async () => {
  try {
    await Tour.insertMany(tours);
    console.log("Data import successful");
  } catch (error) {
    console.log(error);
  }
  process.exit(Nrute);
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Data deletion successful");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv.includes("--import")) {
  importData();
} else if (process.argv.includes("--delete")) {
  deleteData();
}
