const express = require("express");
const { getProfile } = require("../controllers/userController");

const router = express.Router();

// Example route: Get user profile
// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private (you would typically add an authentication middleware here)

router.get("/profile", getProfile);

module.exports = router;
