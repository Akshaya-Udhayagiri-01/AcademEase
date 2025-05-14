const express = require("express");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware"); // ✅ Correct Import

const router = express.Router();

// ✅ Admin-Protected Route
router.get("/protected", authMiddleware, checkRole("admin"), (req, res) => {
    res.json({ msg: "Welcome Admin! You have access to this route." });
});

module.exports = router;
