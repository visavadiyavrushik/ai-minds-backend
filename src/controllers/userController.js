require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
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

const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ msg: "Please verify your email before signing in" });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create a token
    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    res.status(200).json({ success: true, data: { access: token } });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

const getProfile = (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  User.findById(decoded.user.id)
    .then((user) => res.json(user))
    .catch((err) =>
      res.status(500).json({ message: "Failed to fetch user profile" })
    );
};

module.exports = {
  signup,
  signin,
  getProfile,
};
