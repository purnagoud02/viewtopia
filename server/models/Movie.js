const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: [
      {
        type: String,
      },
    ],
    poster: {
      type: String,
      required: true,
    },
    backdrop: {
      type: String,
      default: "",
    },
    cast: [String],
    director: [String],
    runtime: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
    releaseDate: Date,
    year: {
      type: Number,
      required: true,
      index: true,
    },
    language: {
      type: String,
      default: "en",
    },
    budget: Number,
    revenue: Number,
    popularity: Number,
    videos: [
      {
        type: String,
        title: String,
        category: {
          type: String,
          enum: ["trailer", "teaser", "behind-the-scenes", "featurette", "interview", "clip"],
          default: "trailer",
        },
        source: {
          type: String,
          enum: ["youtube", "vimeo", "url"],
          default: "youtube",
        },
      },
    ],
    isPremium: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "now-playing", "popular", "top-rated"],
      default: "now-playing",
      index: true,
    },
    tmdbId: Number,
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

movieSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Movie", movieSchema);