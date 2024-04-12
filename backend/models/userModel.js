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
    // select: false,
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
    default:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  role: { type: String, enum: ["user", "guide", "admin"], default: "user" },
  active: { type: Boolean, default: true, selected: false },
  passwordChangedAt: { type: Date },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (candidatePass, userPass) {
  return (isValidPassword = await bcrypt.compare(candidatePass, userPass));
};

userSchema.methods.controlPasswordDate = async function (JWTtime) {
  if (!this.passwordChangedAt || !JWTtime) {
    return false;
  }

  const changeTime = parseInt(this.passwordChangedAt?.getTime() / 1000);
  return JWTtime < changeTime;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  // console.log(resetToken); // a2c3cb3f8652c3f9004bfb1b493f25f3721538ed900f08bcf0dad31a65ca75e5
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = model("User", userSchema);
module.exports = User;
