const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const AppError = require("./utils/appError");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const xss = require("xss");
const hpp = require("hpp");
const multer = require("multer");

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(mongoSanitize());

// app.use((req, res, next) => {
//   req.body = xss(req.body);
//   req.params = xss(req.params);
//   req.query = xss(req.query);
//   next();
// });

app.use(hpp({ whiteList: ["difficulty", "sort"] }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests sent. Please try again later.",
});
app.use("/api", limiter);

app.use("/api/tours", tourRouter);
app.use("/api/users", userRouter);
app.use("/api/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError("Not Found", 404));
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message || "An unexpected error occurred.";

  res.status(statusCode).json({
    status: status,
    message: message,
  });
});

module.exports = app;
