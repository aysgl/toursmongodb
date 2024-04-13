const validator = require("validator");
const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: true,
    validate: validator.isStrongPassword,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return validator.equals(value, this.password);
      },
      message: "Passwords do not match",
    },
    select: false,
  },
  photo: {
    type: String,
    default: "https://example.com/default-photo.jpg",
  },
  role: { type: String, enum: ["user", "guide", "admin"], default: "user" },
  active: { type: Boolean, default: true, select: false },
  passwordChangedAt: { type: Date },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (candidatePass, userPass) {
  return await bcrypt.compare(candidatePass, userPass);
};

userSchema.methods.controlPasswordDate = function (JWTtime) {
  if (!this.passwordChangedAt || !JWTtime) return false;
  return Math.floor(this.passwordChangedAt.getTime() / 1000) < JWTtime;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = model("User", userSchema);
module.exports = User;
