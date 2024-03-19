const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

exports.signup = async (req, res) => {
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
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = signToken(user.id);

  res
    .status(200)
    .json({ message: "Login successful", data: user, token: token });
};

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  if (!token) {
    return res.status(423).json({ message: "No token provided" });
  }

  try {
    const tkn = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(423).json({ message: "Invalid token" });
  }
};
