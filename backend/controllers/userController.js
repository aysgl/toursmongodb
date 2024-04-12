const User = require("../models/userModel");
const AppError = require("../utils/appError");

exports.updateMe = (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "Password fields cannot be updated using this route. Please use /update-password route for password updates.",
        400
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
  });
};

exports.deleteMe = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(200).json({
    status: "success",
    message: "User is inactive",
  });
};

exports.getUsers = (req, res) => {};

exports.getUser = (req, res) => {};

exports.postUser = (req, res) => {};

exports.patchUser = (req, res) => {};

exports.deleteUser = (req, res) => {};
