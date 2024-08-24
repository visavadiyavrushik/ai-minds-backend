const express = require("express");
const { signup, signin } = require("../controllers/userController");

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

module.exports = router;
