const express = require("express");
const { signup } = require("../controllers/userController");

const { verifyOtp } = require("../controllers/otpController");

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post("/signup", signup);

router.post("/verify-otp", verifyOtp);

module.exports = router;
