const validator = require("validator");
const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
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
  role: { type: String, default: "user" },
  active: { type: Boolean, default: true },
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
});

// userSchema.methods.correctPassword = async function (
//   candidatePassword,
//   userPassword
// ) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

const User = model("User", userSchema);
module.exports = User;
