const { Schema, model } = require("mongoose");

const tourSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    duration: { type: Number, required: true },
    maxGroupSize: { type: Number, required: true },
    difficulty: { type: String },
    ratingsAverage: { type: Number, default: 4.0 },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: true },
    discount: Number,
    summary: { type: String, maxLength: 1000, required: true },
    description: { type: String, maxLength: 1000 },
    imageCover: String,
    images: [String],
    startDates: [Date],
    createdAt: { type: Date, default: Date.now() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.virtual("slug").get(function () {
  return this.name.toLowerCase().split(" ").join("-");
});

const Tour = model("Tour", tourSchema);
module.exports = Tour;
