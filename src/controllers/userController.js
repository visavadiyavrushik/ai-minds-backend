const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generateAndSendOtp } = require("../utils/otpUtils");

const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    user = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    // Generate and send OTP
    await generateAndSendOtp(user);

    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  signup,
};
