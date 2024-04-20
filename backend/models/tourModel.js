const { Schema, model } = require("mongoose");
const validator = require("validator");

const tourSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "This is the name of the tour"],
      // validate: [
      //   validator.isAlpha,
      //   "Name must contain only alphabetical characters",
      // ],
    },
    duration: { type: Number, required: true },
    maxGroupSize: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Not selected",
      },
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
    hour: { type: Number },
    startLocation: {
      type: {
        type: String,
        default: "Point",
      },
      description: String,
      coordinates: [Number],
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
        },
        coordinates: [Number],
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: Schema.ObjectId, ref: "User" }],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("slug").get(function () {
  return this.name.toLowerCase().split(" ").join("-");
});

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

tourSchema.pre("save", function (next) {
  this.hour = this.duration * 24;
  next();
});

tourSchema.pre("aggregate", function (doc) {
  this.pipeline().unshift({ $match: { ratingsAverage: { $gte: 4.5 } } });
  // this.where("ratingsAverage").gte(4.7);
  doc();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordResetToken -passwordResetExpires",
  });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.where("ratingsAverage").gte(4.7);
  next();
});

const Tour = model("Tour", tourSchema);
module.exports = Tour;
