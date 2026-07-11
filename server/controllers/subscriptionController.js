const Subscription = require("../models/Subscription");
const User = require("../models/User");

const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });
    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubscriptionHistory = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });
    res.json({ history: subscription?.history || [], invoices: subscription?.invoices || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upsertSubscription = async ({ userId, plan, billingCycle, provider, status = "active", autoRenew = true }) => {
  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + (billingCycle === "yearly" ? 12 : 1));

  const isPremiumPlan = plan && plan !== "free";

  const subscription = await Subscription.findOneAndUpdate(
    { userId },
    {
      $set: {
        plan,
        billingCycle,
        provider,
        status,
        autoRenew,
        startDate: new Date(),
        renewalDate,
        expiresAt: renewalDate,
      },
      $push: {
        history: {
          event: status === "cancelled" ? "cancelled" : "activated",
          plan,
          billingCycle,
          provider,
          status,
          createdAt: new Date(),
        },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.findByIdAndUpdate(userId, {
    plan: isPremiumPlan && status === "active" ? plan : "free",
    isPremium: isPremiumPlan && status === "active",
    subscriptionStatus: status,
    subscriptionRenewal: isPremiumPlan && status === "active" ? renewalDate : null,
  });

  return subscription;
};

const createOrUpdateSubscription = async (req, res) => {
  try {
    const { plan, billingCycle, autoRenew = true, provider = "manual", status = "pending" } = req.body;
    const subscription = await upsertSubscription({
      userId: req.user._id,
      plan,
      billingCycle,
      provider,
      status,
      autoRenew,
    });

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upgradePlan = async (req, res) => {
  try {
    const { plan, billingCycle = "monthly", provider = "manual" } = req.body;
    const subscription = await upsertSubscription({ userId: req.user._id, plan, billingCycle, provider, autoRenew: true });
    res.json({ message: "Plan upgraded", subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downgradePlan = async (req, res) => {
  try {
    const { plan, billingCycle = "monthly", provider = "manual" } = req.body;
    const subscription = await upsertSubscription({ userId: req.user._id, plan, billingCycle, provider, autoRenew: false });
    res.json({ message: "Plan downgraded", subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.user._id },
      {
        status: "cancelled",
        autoRenew: false,
        $push: {
          history: {
            event: "cancelled",
            plan: "free",
            billingCycle: "monthly",
            provider: "manual",
            status: "cancelled",
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    await User.findByIdAndUpdate(req.user._id, {
      plan: "free",
      isPremium: false,
      subscriptionStatus: "cancelled",
    });

    res.json({ message: "Subscription cancelled", subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvoices = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });
    res.json(subscription?.invoices || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubscription,
  getSubscriptionHistory,
  createOrUpdateSubscription,
  upgradePlan,
  downgradePlan,
  cancelSubscription,
  getInvoices,
};