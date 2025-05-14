const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // ✅ Ensure correct import
const { authMiddleware } = require("../middleware/authMiddleware");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// ✅ User Signup Route
router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    console.log("📩 Incoming Signup Request:", req.body); // Debugging log

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation Errors:", errors.array()); // Debugging log
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        console.log("⚠️ User already exists:", email); // Debugging log
        return res.status(400).json({ msg: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ name, email, password: hashedPassword, role });

      await user.save();
      console.log("✅ User Created Successfully:", user); // Debugging log

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error("❌ Signup Error:", err); // Debugging log
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// ✅ User Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ msg: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ msg: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
  }
});
  

// ✅ Protected Route (Move it Inside `router`)
router.get("/protected", authMiddleware, (req, res) => {
  res.json({ msg: "You have accessed a protected route!", user: req.user });
});

// ✅ Get Logged-in User's Details
router.get("/me", authMiddleware, async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
          return res.status(404).json({ msg: "User not found" });
      }
      res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
      console.error("❌ User Fetch Error:", err);
      res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
