const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getSubscription,
  getSubscriptionHistory,
  createOrUpdateSubscription,
  upgradePlan,
  downgradePlan,
  cancelSubscription,
  getInvoices,
} = require("../controllers/subscriptionController");

router.get("/", protect, getSubscription);
router.get("/history", protect, getSubscriptionHistory);
router.get("/invoices", protect, getInvoices);
router.post("/", protect, createOrUpdateSubscription);
router.post("/upgrade", protect, upgradePlan);
router.post("/downgrade", protect, downgradePlan);
router.post("/cancel", protect, cancelSubscription);

module.exports = router;