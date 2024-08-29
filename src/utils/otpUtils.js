const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const OTP = require("../models/otpModel");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

// * Function to generate and send OTP
const generateAndSendOtp = async (user) => {
  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false, // No alphabets
    upperCaseAlphabets: false, // No uppercase
    specialChars: false, // No special characters
    lowerCaseAlphabets: false,
  });
  const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

  // Save OTP to OTP collection
  await OTP.create({
    email: user.email,
    otp,
    expiration: otpExpiration,
  });

  await sendOtpEmail(user.email, otp);
};

module.exports = {
  generateAndSendOtp,
};
