const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { uploadAvatar } = require("../config/multer");
const User = require("../models/User");

router.get("/", (req, res) => {
  res.json({ message: "Upload Route Root Working ✅" });
});

router.post("/avatar", protect, uploadAvatar.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    const user = await User.findById(req.user._id);
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;