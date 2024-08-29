require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { generateAndSendOtp } = require("../utils/otpUtils");

const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
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

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
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
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before signing in" });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
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

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ msg: "User with this email does not exist" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

    // Save the reset token and expiration to the user model
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpiration;
    await user.save();

    // Send the reset token via email
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) requested a password reset. Please click the following link to reset your password: ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({
      success: true,
      msg: "Email sent with password reset instructions",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  // const { resetToken } = req.params;
  const { password, resetToken } = req.body;
  console.log("req: ", resetToken);

  try {
    // Find the user by the reset token and check if the token is still valid
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save the updated user
    await user.save();

    res.status(200).json({ success: true, msg: "Password has been reset" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

// Function to send email
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

const getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.user.id).select("-password"); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

module.exports = {
  signup,
  signin,
  getProfile,
  forgotPassword,
  resetPassword,
};
