const { Schema, model } = require("mongoose");
const validator = require("validator");

const tourSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      validate: [
        validator.isAlpha,
        "Name must contain only alphabetical characters",
      ],
    },
    duration: { type: Number, required: true },
    maxGroupSize: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: { values: ["easy", "moderate"], message: "Not selected" },
    },
    ratingsAverage: { type: Number, default: 4.0 },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: true },
    discount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value <= this.price;
        },
        message: "Discount price cannot be greater than the original price",
      },
    },
    summary: { type: String, maxLength: 1000, required: true },
    description: { type: String, maxLength: 1000 },
    imageCover: String,
    images: [String],
    startDates: [Date],
    createdAt: { type: Date, default: Date.now() },
    hour: { type: Number },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.virtual("slug").get(function () {
  return this.name.toLowerCase().split(" ").join("-");
});

tourSchema.pre("save", function (next) {
  this.hour = this.duration * 24;
  next();
});

tourSchema.pre("aggregate", function (doc, next) {
  this.pipeline().unshift({ $match: { ratingsAverage: { $gte: 4.5 } } });
  // this.where("ratingsAverage").gte(4.7);
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.where("ratingsAverage").gte(4.7);
  next();
});

const Tour = model("Tour", tourSchema);
module.exports = Tour;
