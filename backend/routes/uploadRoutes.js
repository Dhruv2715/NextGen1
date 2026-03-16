const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/video", protect, upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file provided" });
    }

    // Cloudinary upload from buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "video", folder: "interviews" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          return res.status(500).json({ message: "Upload failed", error });
        }
        res.status(200).json({ url: result.secure_url });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    console.error("Video upload error:", err);
    res.status(500).json({ message: "Server error during upload" });
  }
});

module.exports = router;
