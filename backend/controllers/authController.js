const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const sendMail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    res
      .status(201)
      .json({ message: "success newUser", data: newUser, token: token });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password ????", 401));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const isValidPassword = await user.correctPassword(password, user.password);

  if (!isValidPassword) {
    return next(new AppError("Invalid email or password", 400));
  }

  const token = signToken(user.id);

  res
    .status(200)
    .json({ message: "Login successful", data: user, token: token });
};

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    token = token.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("No token provided", 403));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.message === "jwt expired") {
      return next(new AppError("Your session has expired", 403));
    } else {
      return next(new AppError("No token provided", 403));
    }
  }

  const activeUser = await User.findById(decoded.id);
  if (!activeUser) {
    return next(new AppError("User not found", 403));
  }

  // controlPasswordDate yöntemi asenkron olarak çalıştırılıyor
  if (await activeUser.controlPasswordDate(decoded.iat)) {
    return next(
      new AppError("Your session has expired, Please try again login", 403)
    );
  }

  req.user = activeUser;
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not authorized to access this route", 401)
      );
    }
    next();
  };

exports.resetPassword = (req, res, next) => {};

exports.forgorPassword = (req, res, next) => {};
