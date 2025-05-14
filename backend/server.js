require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const materialsRoutes = require("./routes/materials");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ✅ Middleware (Must be above routes)
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("AcademEase API is running...");
});

// ✅ Routes (Must come after middleware)
app.use("/api/auth", authRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/materials", require("./routes/materials"));
app.use("/api/materials", materialsRoutes);
app.use("/uploads", express.static("uploads")); // Serve uploaded files publicly

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

