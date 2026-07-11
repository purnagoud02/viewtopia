const mongoose = require("mongoose");

const tvShowSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    genre: { type: String, default: "" },
    poster: { type: String, default: "" },
    backdrop: { type: String, default: "" },
    trailer: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    year: { type: Number, default: new Date().getFullYear() },
    seasons: { type: Number, default: 1 },
    type: { type: String, default: "Series" },
    rating: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TVShow", tvShowSchema);
