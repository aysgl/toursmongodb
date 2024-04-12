const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const AppError = require("./utils/appError");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests sent. Please try again later.",
});
app.use("/api", limiter);

app.use("/api/tours", tourRouter);
app.use("/api/users", userRouter);

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
