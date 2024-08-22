const express = require("express");
const bodyParser = require("body-parser");
const User = require("./src/models/User");
const app = express();
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDB();

// // Route to handle signup
// app.post("/auth/signup", async (req, res) => {
//   const { fullName, email, password } = req.body;

//   if (!fullName || !email || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email is already in use" });
//     }
//     const newUser = new User({ fullName, email, password });
//     await newUser.save();
//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });4

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => res.send("API is running..."));

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
