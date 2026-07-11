const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ["free", "basic", "premium", "student"],
      default: "free",
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    provider: {
      type: String,
      enum: ["manual", "stripe", "razorpay"],
      default: "manual",
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    renewalDate: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
    invoices: [
      {
        invoiceId: String,
        provider: String,
        amount: Number,
        currency: String,
        plan: String,
        billingCycle: String,
        status: { type: String, default: "paid" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    history: [
      {
        event: String,
        plan: String,
        billingCycle: String,
        provider: String,
        status: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);