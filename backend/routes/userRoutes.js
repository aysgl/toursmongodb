const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

router.use(authController.protect);
router.patch("/update-password", authController.updatePassword);

router.patch("/update-me", userController.updateMe);
router.delete("/delete-me", userController.deleteMe);

router.route("/").get(userController.getUsers).post(userController.postUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);

module.exports = router;
