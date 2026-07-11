const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator", "premium"],
      default: "user",
    },
    plan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "expired",
    },
    subscriptionRenewal: Date,
    avatar: {
      type: String,
      default: "",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationToken: String,
    verificationExpires: Date,
    googleId: String,
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    watchTimeMinutes: {
      type: Number,
      default: 0,
    },
    favouriteGenres: [String],
    devicesLoggedIn: {
      type: Number,
      default: 1,
    },
    storageUsedGb: {
      type: Number,
      default: 0,
    },
    watchHistory: [
      {
        movieId: String,
        title: String,
        poster: String,
        genre: String,
        progress: Number,
        watchedAt: { type: Date, default: Date.now },
      },
    ],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
    notifications: [
      {
        title: String,
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
