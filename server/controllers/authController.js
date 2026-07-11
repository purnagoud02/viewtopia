const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  plan: user.plan,
  avatar: user.avatar || "",
  isPremium: user.isPremium,
  subscriptionStatus: user.subscriptionStatus,
  subscriptionRenewal: user.subscriptionRenewal,
  emailVerified: user.emailVerified,
  profileCompleted: user.profileCompleted,
  watchHistory: user.watchHistory || [],
  favorites: user.favorites || [],
  notifications: user.notifications || [],
});

const createAuthResponse = (res, user, accessToken, refreshToken) => {
  res.json({
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const notification = {
      title: "Welcome to Viewtopia",
      message: "Your account is ready. Start watching and build your personalized watchlist.",
    };

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationExpires: Date.now() + 24 * 60 * 60 * 1000,
      notifications: [notification],
    });

    const accessToken = createAccessToken(user._id, user.role);
    const refreshToken = createRefreshToken(user._id, user.role);
    user.refreshToken = refreshToken;
    await user.save();

    return createAuthResponse(res, user, accessToken, refreshToken);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = createAccessToken(user._id, user.role);
    const refreshToken = createRefreshToken(user._id, user.role);
    user.refreshToken = refreshToken;
    await user.save();

    return createAuthResponse(res, user, accessToken, refreshToken);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Refresh token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = createAccessToken(user._id, user.role);
    return res.json({ accessToken, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(401).json({ message: "Refresh token invalid or expired" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id || req.user?.id);
    if (user) {
      user.refreshToken = "";
      await user.save();
    }
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    return res.json(sanitizeUser(req.user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.email && updates.email !== req.user.email) {
      updates.emailVerified = false;
      updates.verificationToken = crypto.randomBytes(20).toString("hex");
      updates.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    user.profileCompleted = true;
    await user.save();
    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or expired" });
    }

    user.emailVerified = true;
    user.verificationToken = "";
    user.verificationExpires = null;
    await user.save();
    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const verificationToken = crypto.randomBytes(20).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    return res.json({
      message: "Verification email re-sent",
      verificationLink: `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${verificationToken}`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been generated." });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    return res.json({
      message: "Password reset link generated",
      resetLink: `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${token}`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: "Reset token is invalid or expired" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;
    await user.save();
    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { name, email, avatar, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Google account email is required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email,
        email,
        password: crypto.randomBytes(24).toString("hex"),
        googleId,
        avatar,
        emailVerified: true,
        profileCompleted: true,
        notifications: [{ title: "Welcome", message: "Google login enabled for your account." }],
      });
    } else if (!user.googleId && googleId) {
      user.googleId = googleId;
      user.avatar = avatar || user.avatar;
      user.emailVerified = true;
      await user.save();
    }

    const accessToken = createAccessToken(user._id, user.role);
    const refreshToken = createRefreshToken(user._id, user.role);
    user.refreshToken = refreshToken;
    await user.save();
    return createAuthResponse(res, user, accessToken, refreshToken);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const saveWatchHistory = async (req, res) => {
  try {
    const { movieId, title, poster, genre, progress } = req.body;
    const user = await User.findById(req.user._id);
    const entry = { movieId, title, poster, genre, progress: progress || 0, watchedAt: new Date() };
    const existingIndex = user.watchHistory.findIndex((item) => item.movieId === movieId);
    if (existingIndex >= 0) {
      user.watchHistory[existingIndex] = entry;
    } else {
      user.watchHistory.unshift(entry);
      user.watchHistory = user.watchHistory.slice(0, 12);
    }
    user.watchTimeMinutes = (user.watchTimeMinutes || 0) + 1;
    await user.save();
    return res.json(user.watchHistory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getWatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.json(user.watchHistory || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user._id);
    if (user.favorites.includes(movieId)) {
      user.favorites = user.favorites.filter((id) => id.toString() !== movieId);
    } else {
      user.favorites.push(movieId);
    }
    await user.save();
    return res.json(user.favorites);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    return res.json(user.favorites || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.json(user.notifications || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.notifications = (user.notifications || []).map((item) => ({ ...item, read: true }));
    await user.save();
    return res.json(user.notifications || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};