const express = require("express");
const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

const { verifyOtp } = require("../controllers/otpController");

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post("/signup", signup);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP
// @access  Public
router.post("/verify-otp", verifyOtp);

// @route   POST /api/auth/signin
// @desc    Sign in a user
// @access  Public
router.post("/signin", signin);

// Forgot Password and Reset Password routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
