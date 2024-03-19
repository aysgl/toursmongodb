const validator = require("validator");
const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

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
    select: false,
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
  },
  photo: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  role: { type: String, enum: ["user", "guide", "admin"], default: "user" },
  active: { type: Boolean, default: true, selected: false },
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
});

const User = model("User", userSchema);
module.exports = User;
