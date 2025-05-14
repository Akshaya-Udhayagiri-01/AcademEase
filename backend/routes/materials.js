const express = require("express");
const multer = require("multer");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware"); // ✅ Correct import
const Material = require("../models/Material");
const path = require("path");

const router = express.Router();

// 🔹 Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Upload Study Material (Admins Only)
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const { title, subject, semester } = req.body;
    const fileName = req.file.originalname; // ✅ Get the original filename
    const fileUrl = req.file.path.replace(/\\/g, "/"); // ✅ Ensure correct file path

    const newMaterial = new Material({
      title,
      subject,
      semester,
      fileName,  // ✅ Store fileName in DB
      fileUrl,
    });

    await newMaterial.save();
    res.status(201).json({ msg: "Material uploaded successfully", material: newMaterial });

  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});


// 👀 View Study Materials (Students & Admins)
router.get("/view", authMiddleware, async (req, res) => {
  try {
    const materials = await Material.find().select("-__v");
    res.json(materials); // ✅ Return array directly instead of { materials: [...] }
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// 📂 Download Study Material (Students & Admins)
router.get("/download/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student" && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ msg: "Material not found" });
    }

    const filePath = path.join(__dirname, "..", material.fileUrl);
    
    // ✅ Ensure filename is valid
    let fileName = material.fileName?.trim() || "study_material.pdf";
    
    // ✅ Add .pdf extension if missing
    if (!fileName.toLowerCase().endsWith(".pdf")) {
      fileName += ".pdf";
    }

    res.download(filePath, fileName); // ✅ Set the correct filename

  } catch (err) {
    console.error("❌ Download Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});


module.exports = router;
