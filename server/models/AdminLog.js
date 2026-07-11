const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema(
  {
    actor: { type: String, default: "admin" },
    action: { type: String, required: true },
    details: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminLog", adminLogSchema);
