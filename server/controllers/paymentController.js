const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

let razorpayClient = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const planAmounts = {
  free: 0,
  basic: 19900,
  premium: 69900,
  student: 34900,
};

const persistSubscriptionActivation = async ({ userId, plan, billingCycle, provider, amount, invoiceId }) => {
  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + (billingCycle === "yearly" ? 12 : 1));

  const subscription = await Subscription.findOneAndUpdate(
    { userId },
    {
      $set: {
        plan,
        billingCycle,
        provider,
        status: "active",
        autoRenew: true,
        startDate: new Date(),
        renewalDate,
        expiresAt: renewalDate,
      },
      $push: {
        invoices: {
          invoiceId: invoiceId || `inv_${Date.now()}`,
          provider,
          amount: amount || planAmounts[plan] || 0,
          currency: "INR",
          plan,
          billingCycle,
          status: "paid",
          createdAt: new Date(),
        },
        history: {
          event: "activated",
          plan,
          billingCycle,
          provider,
          status: "active",
          createdAt: new Date(),
        },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.findByIdAndUpdate(userId, {
    plan,
    isPremium: plan !== "free",
    subscriptionStatus: "active",
    subscriptionRenewal: renewalDate,
  });

  return subscription;
};

const createOrder = async (req, res) => {
  try {
    if (!razorpayClient) {
      return res.status(500).json({
        message: "Payment provider is not configured. Please set Razorpay credentials.",
      });
    }

    const { plan, billingCycle = "monthly" } = req.body;
    if (!plan || !planAmounts[plan]) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    const amount = planAmounts[plan];
    const order = await razorpayClient.orders.create({
      amount,
      currency: "INR",
      receipt: `subscription_${req.user._id}_${Date.now()}`,
      notes: { plan, billingCycle, userId: String(req.user._id) },
      payment_capture: 1,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
      billingCycle,
      key_id: process.env.RAZORPAY_KEY_ID || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      plan,
      billingCycle,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment signature mismatch" });
    }

    await persistSubscriptionActivation({
      userId: req.user._id,
      plan,
      billingCycle,
      provider: "razorpay",
      amount: planAmounts[plan] || 0,
      invoiceId: razorpay_payment_id,
    });

    res.json({ message: "Payment verified and subscription updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStripeCheckout = async (req, res) => {
  try {
    const { plan, billingCycle = "monthly" } = req.body;
    const amount = planAmounts[plan] || 0;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.json({
        success: true,
        url: `/subscription/success?provider=stripe&plan=${plan}&billingCycle=${billingCycle}`,
        provider: "stripe",
        mock: true,
      });
    }

    const Stripe = require("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price_data: { currency: "usd", product_data: { name: `${plan} plan` }, unit_amount: amount / 100 }, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/subscription/success?provider=stripe&plan=${plan}&billingCycle=${billingCycle}`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/subscription/failure?provider=stripe&plan=${plan}&billingCycle=${billingCycle}`,
    });

    res.json({ success: true, url: session.url, provider: "stripe" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const stripeSuccess = async (req, res) => {
  try {
    const { plan, billingCycle } = req.query;
    const subscription = await persistSubscriptionActivation({
      userId: req.user._id,
      plan: plan || "premium",
      billingCycle: billingCycle || "monthly",
      provider: "stripe",
      amount: planAmounts[plan] || 0,
      invoiceId: `stripe_${Date.now()}`,
    });
    res.json({ message: "Stripe checkout completed", subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });
    res.json({ payments: subscription?.invoices || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const subscription = await Subscription.findOne({ userId: req.user._id });
    const invoice = subscription?.invoices?.find((item) => item.invoiceId === invoiceId);
    res.json({ invoiceId, invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  createStripeCheckout,
  stripeSuccess,
  getPaymentHistory,
  getInvoice,
};

// Webhook handler for Razorpay
const webhookHandler = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const payload = req.body; // raw buffer expected
    const signature = req.headers['x-razorpay-signature'];

    if (!secret || !signature) {
      return res.status(400).send('Webhook misconfigured');
    }

    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (expected !== signature) {
      return res.status(400).send('Signature mismatch');
    }

    const json = JSON.parse(payload.toString());
    const ev = json.event;

    // Persist raw webhook event for auditing
    const WebhookEvent = require('../models/WebhookEvent');
    await WebhookEvent.create({ provider: 'razorpay', event: ev, payload: json, processed: false });

    if (ev === 'payment.captured' || ev === 'order.paid') {
      const orderEntity = json.payload?.order?.entity || json.payload?.payment?.entity || null;
      const notes = orderEntity?.notes || {};
      const userId = notes.userId;
      const plan = notes.plan || 'premium';
      const billingCycle = notes.billingCycle || 'monthly';

      if (userId) {
        await persistSubscriptionActivation({
          userId,
          plan,
          billingCycle,
          provider: 'razorpay-webhook',
          amount: orderEntity?.amount || 0,
          invoiceId: json.payload?.payment?.entity?.id || `webhook_${Date.now()}`,
        });
      }
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook error', err.message);
    res.status(500).send('error');
  }
};

module.exports.webhookHandler = webhookHandler;

// Admin endpoints for webhook events
const getWebhookEvents = async (req, res) => {
  try {
    const WebhookEvent = require('../models/WebhookEvent');
    const events = await WebhookEvent.find().sort({ createdAt: -1 }).limit(200);
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markWebhookProcessed = async (req, res) => {
  try {
    const { id } = req.params;
    const WebhookEvent = require('../models/WebhookEvent');
    const ev = await WebhookEvent.findByIdAndUpdate(id, { processed: true }, { new: true });
    res.json({ event: ev });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getWebhookEvents = getWebhookEvents;
module.exports.markWebhookProcessed = markWebhookProcessed;