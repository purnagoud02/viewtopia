const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  createStripeCheckout,
  stripeSuccess,
  getPaymentHistory,
  getInvoice,
  webhookHandler,
} = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
// Webhook endpoint (do not require auth) - server registers raw body handler
router.post("/webhook", webhookHandler);
router.post("/stripe-checkout", protect, createStripeCheckout);
router.get("/stripe-success", protect, stripeSuccess);
router.get("/history", protect, getPaymentHistory);
router.get("/invoice/:invoiceId", protect, getInvoice);

// Admin-only endpoints to inspect webhook events
router.get('/webhooks', protect, admin, require('../controllers/paymentController').getWebhookEvents);
router.post('/webhooks/:id/mark', protect, admin, require('../controllers/paymentController').markWebhookProcessed);

module.exports = router;
