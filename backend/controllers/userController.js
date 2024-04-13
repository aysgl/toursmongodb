const User = require("../models/userModel");
const AppError = require("../utils/appError");
const filterObj = require("../utils/filterObj");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handleFactory");

exports.updateMe = async (req, res, next) => {
  try {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "Password fields cannot be updated using this route. Please use /update-password route for password updates.",
          400
        )
      );
    }

    const filtredBody = filterObj(req.body, "username", "email", "photo");

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filtredBody, {
      new: true,
    });

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return next(new AppError(error.message));
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      active: false,
    });

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "User is inactive",
    });
  } catch (error) {
    return next(new AppError(error.message));
  }
};

exports.getUsers = getAll(User);

exports.getUser = getOne(User);

exports.createUser = createOne(User);

exports.updateUser = updateOne(User);

exports.deleteUser = deleteOne(User);
