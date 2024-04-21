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
const multer = require("multer");
const sharp = require("sharp");

// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/img/users");
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage({});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Invalid", 400)), false;
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadPhoto = upload.single("photo");

exports.resizePhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const filename = `${req.user.id}-${Date.now()}.jpeg`;

    const image = await sharp(req.file.buffer)
      .resize(400, 400)
      .toFormat("jpeg")
      .jpeg({ quality: 70 })
      .toFile(`public/img/users/${filename}`);
    res.status(200).json({
      status: "success",
      message: "Image resized successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

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

    const filtredBody = filterObj(req.body, "username", "email");

    if (req.file) filtredBody.photo = req.file.filename;

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
