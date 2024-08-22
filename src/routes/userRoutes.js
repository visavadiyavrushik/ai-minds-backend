const express = require("express");

const router = express.Router();

// Example route: Get user profile
// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private (you would typically add an authentication middleware here)

router.get("/profile", (req, res) => {
  res.send("User profile route");
});

module.exports = router;
