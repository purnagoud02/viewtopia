const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, default: "general" },
    details: { type: String, default: "" },
    status: { type: String, enum: ["open", "reviewed", "resolved"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
