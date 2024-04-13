const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const sendMail = require("../utils/email");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

const creteSendToken = (user, statuCode, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // secure: true,
  });

  user.password = undefined;
  res.status(statuCode).json({ message: "open", user, token });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    creteSendToken(newUser, 201, res);
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 401));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return next(new AppError("Invalid email or password", 400));
    }

    creteSendToken(user, 200, res);
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
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

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendMail({
      email: user.email,
      subject: "Reset Password",
      html: `<h1>Merhaba ${user.email}</h1> 
      <div>
        <a href="${req.protocol}://${req.headers.host}/api/users/reset-password/${resetToken}">Click on the following link to reset your password: http://127.0.0.1:8080/api/users/reset-password/${resetToken}</a>
      </div>`,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(new AppError(error.message, 400));
  }
  res.status(200).json({ message: "Reset Password" });
};

exports.resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    // console.log(token);
    // e4ec841ebf8ab72c07844ce24f7fa8f562cad2d81f0285fb902f87844901afad

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError(404, "Token is not available"));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "New password is successfull" });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    if (
      !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
      return next(new AppError("Passwords do not match", 400));
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPassword;

    await user.save();

    creteSendToken(user, 200, res);
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
