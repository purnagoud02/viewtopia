const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getProfile,
  updateProfile,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleLogin,
  saveWatchHistory,
  getWatchHistory,
  toggleFavorite,
  getFavorites,
  getNotifications,
  markNotificationsRead,
} = require("../controllers/authController");

const validateAuth = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validateAuth,
  registerUser
);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateAuth,
  loginUser
);
router.post("/refresh-token", refreshToken);
router.post("/logout", protect, logoutUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", protect, resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google-login", googleLogin);
router.post("/watch-history", protect, saveWatchHistory);
router.get("/watch-history", protect, getWatchHistory);
router.post("/favorites", protect, toggleFavorite);
router.get("/favorites", protect, getFavorites);
router.get("/notifications", protect, getNotifications);
router.post("/notifications/read", protect, markNotificationsRead);

module.exports = router;