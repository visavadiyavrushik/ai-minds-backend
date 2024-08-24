const OTP = require("../models/otpModel");
const User = require("../models/userModel");

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpEntry = await OTP.findOne({ email, otp });
    if (!otpEntry) {
      return res.status(404).json({ msg: "Invalid OTP" });
    }

    if (otpEntry.expiration < Date.now()) {
      await OTP.deleteOne({ email, otp }); // Optionally clean up expired OTPs
      return res.status(400).json({ msg: "OTP has expired" });
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // OTP is valid, clear OTP
    await OTP.deleteOne({ email, otp });

    res.status(200).json({ msg: "OTP verified successfully", user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  verifyOtp,
};
