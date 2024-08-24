const express = require("express");
const bodyParser = require("body-parser");
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

app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/", (res) => res.send("API is running..."));

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
