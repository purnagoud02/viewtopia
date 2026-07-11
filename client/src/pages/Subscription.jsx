import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import "./Subscription.css";
import Toast from "../components/Toast";
import Spinner from "../components/Spinner";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const plans = [
  {
    key: "free",
    name: "Free",
    price: 0,
    description: "Great for casual viewing",
    features: ["Ads included", "Standard quality", "1 device", "Limited library"],
    highlighted: false,
  },
  {
    key: "basic",
    name: "Basic",
    price: 199,
    description: "HD streaming with more flexibility",
    features: ["No ads", "720p HD", "1 device", "Offline downloads"],
    highlighted: false,
  },
  {
    key: "student",
    name: "Student",
    price: 349,
    description: "Premium for everyday bingeing",
    features: ["No ads", "1080p Full HD", "2 devices", "Student pricing"],
    highlighted: false,
  },
  {
    key: "premium",
    name: "Premium",
    price: 699,
    description: "Ultra HD with full access",
    features: ["4K Ultra HD", "HDR & Dolby Atmos", "4 devices", "Priority support"],
    highlighted: true,
  },
];

const paymentMethods = [
  { id: "upi", label: "UPI", icon: "📱", description: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Cards", icon: "💳", description: "Credit, Debit, RuPay" },
  { id: "wallet", label: "Wallets", icon: "👜", description: "Fast wallet checkout" },
  { id: "netbanking", label: "Net Banking", icon: "🏦", description: "Bank transfer support" },
];

function Subscription() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");

  const planItem = useMemo(() => plans.find((plan) => plan.key === selectedPlan), [selectedPlan]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getPlanPrice = (planKey) => {
    const plan = plans.find((item) => item.key === planKey);
    if (!plan) return 0;
    return billingCycle === "yearly" ? Math.floor(plan.price * 10) : plan.price;
  };

  useEffect(() => {
    const loadCurrentSubscription = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setStatusMessage("Please log in to view and manage subscriptions.");
        return;
      }

      try {
        const { data } = await axios.get(`${API_BASE}/api/subscription/`, { headers: getAuthHeaders() });
        if (data && data.plan) {
          setCurrentSubscription(data);
          setStatusMessage(`Current plan: ${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} (${data.status})`);
        }
      } catch {
        setStatusMessage("Free plan (not subscribed)");
      }
    };

    loadCurrentSubscription();
  }, []);

  const handlePlanSelection = (planKey) => {
    setSelectedPlan(planKey);
    if (planKey === "free") {
      setShowCheckout(false);
      setStatusMessage("Free plan selected. No payment is required.");
      setError("");
      return;
    }

    setShowCheckout(true);
    setError("");
    setStatusMessage("");
  };

  const handlePayment = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setError("Please log in to subscribe.");
      setShowCheckout(false);
      return;
    }

    if (selectedPlan === "free") {
      setStatusMessage("Free plan selected. No payment is required.");
      setError("");
      return;
    }

    if (paymentMethod === "upi" && !upiId.trim()) {
      setError("Please enter your UPI ID to continue.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setShowCheckout(false);
      setStatusMessage(`Preparing secure ${paymentMethod === "upi" ? "UPI" : paymentMethod} checkout for ${planItem?.name || "Premium"}...`);

      const { data } = await axios.post(
        `${API_BASE}/api/payments/create-order`,
        { plan: selectedPlan, billingCycle },
        { headers: getAuthHeaders() }
      );

      if (!data || !data.orderId) {
        throw new Error(data?.message || "Failed to create payment order");
      }

      const options = {
        key: data.key_id || window.RAZORPAY_KEY_ID || "",
        amount: data.amount,
        currency: data.currency,
        name: "Viewtopia",
        description: `${planItem?.name || "Premium"} subscription • ${paymentMethod === "upi" ? "UPI" : paymentMethod}`,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            await axios.post(
              `${API_BASE}/api/payments/verify`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: selectedPlan,
                billingCycle,
              },
              { headers: getAuthHeaders() }
            );

            navigate(`/subscription/success?provider=razorpay&plan=${selectedPlan}&billingCycle=${billingCycle}`);
          } catch (verifyErr) {
            setError("Payment verification failed: " + (verifyErr.response?.data?.message || verifyErr.message));
            navigate(`/subscription/failure?provider=razorpay&plan=${selectedPlan}&billingCycle=${billingCycle}`);
          }
        },
        modal: {
          ondismiss: function () {
            setStatusMessage("Payment cancelled");
            setLoading(false);
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else if (options.key) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        navigate(`/subscription/success?provider=mock&plan=${selectedPlan}&billingCycle=${billingCycle}`);
      }
    } catch (err) {
      setLoading(false);
      setError("Payment error: " + (err.response?.data?.message || err.message));
      const params = new URLSearchParams({ provider: "checkout", plan: selectedPlan, billingCycle, reason: err.message });
      navigate(`/subscription/failure?${params.toString()}`);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/api/subscription/cancel`, {}, { headers: getAuthHeaders() });
      setCurrentSubscription({ plan: "free", billingCycle: "monthly", status: "cancelled" });
      setStatusMessage("Your subscription has been cancelled. Premium access has been removed.");
      setError("");
    } catch (err) {
      setError("Unable to cancel subscription: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const goToHistory = () => {
    window.location.href = "/subscription/history";
  };

  return (
    <div className="page subscription-page">
      <section className="subscription-hero">
        <h1>Choose Your Premium Plan</h1>
        <p>Unlock cinematic quality, exclusive titles, and ad-free viewing.</p>
      </section>

      {loading && (
        <div className="glass">
          <Spinner />
        </div>
      )}
      <Toast
        message={error || statusMessage}
        type={error ? "error" : "info"}
        onClose={() => {
          setError("");
          setStatusMessage("");
        }}
      />

      <div className="billing-toggle">
        <button className={`toggle-btn ${billingCycle === "monthly" ? "active" : ""}`} onClick={() => setBillingCycle("monthly")}>Monthly</button>
        <button className={`toggle-btn ${billingCycle === "yearly" ? "active" : ""}`} onClick={() => setBillingCycle("yearly")}>Yearly <span className="badge">Save 17%</span></button>
      </div>

      {currentSubscription && currentSubscription.plan !== "free" && currentSubscription.status !== "cancelled" && (
        <div className="subscription-actions">
          <button className="plan-button btn-secondary" onClick={handleCancelSubscription} disabled={loading}>Cancel Subscription</button>
          <button className="plan-button btn-outline" onClick={goToHistory} disabled={loading}>View History</button>
        </div>
      )}

      <div className="plans-container">
        {plans.map((plan) => (
          <motion.div
            key={plan.key}
            className={`plan-card ${plan.highlighted ? "highlighted" : ""} ${currentSubscription?.plan === plan.key ? "current" : ""}`}
            whileHover={{ transform: "translateY(-8px)" }}
            onClick={() => setSelectedPlan(plan.key)}
          >
            {plan.highlighted && <div className="best-value-badge">Most Popular</div>}
            {currentSubscription?.plan === plan.key && <div className="current-badge">Current Plan</div>}

            <div className="plan-header">
              <h3>{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
            </div>

            <div className="plan-price">
              {plan.price === 0 ? (
                <span className="price-free">Always Free</span>
              ) : (
                <>
                  <span className="currency">₹</span>
                  <span className="amount">{getPlanPrice(plan.key)}</span>
                  <span className="period">/{billingCycle === "yearly" ? "year" : "month"}</span>
                </>
              )}
            </div>

            <div className="plan-features">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="feature">
                  <span className="feature-icon">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              className={`plan-button ${plan.key === "free" ? "btn-secondary" : selectedPlan === plan.key ? "btn-primary active" : "btn-secondary"}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePlanSelection(plan.key);
              }}
              disabled={loading || (currentSubscription?.plan === plan.key && plan.key !== "free")}
            >
              {currentSubscription?.plan === plan.key && plan.key !== "free"
                ? "✓ Current Plan"
                : plan.key === "free"
                  ? "Use Free Plan"
                  : loading && selectedPlan === plan.key
                    ? "Processing..."
                    : "Continue to Checkout"}
            </button>
          </motion.div>
        ))}
      </div>

      {showCheckout && planItem && planItem.key !== "free" && (
        <div className="checkout-overlay" onClick={() => setShowCheckout(false)}>
          <motion.div
            className="checkout-sheet"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="checkout-header">
              <div>
                <p className="checkout-eyebrow">Secure checkout</p>
                <h3>Complete your {planItem.name} plan</h3>
              </div>
              <button type="button" className="checkout-close" onClick={() => setShowCheckout(false)}>
                ×
              </button>
            </div>

            <div className="checkout-summary">
              <div className="checkout-card summary-card">
                <p>Selected plan</p>
                <strong>{planItem.name}</strong>
                <span>{planItem.description}</span>
              </div>
              <div className="checkout-card summary-card accent">
                <p>Total due today</p>
                <strong>₹{getPlanPrice(planItem.key)}</strong>
                <span>{billingCycle === "yearly" ? "Billed yearly" : "Billed monthly"}</span>
              </div>
            </div>

            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`payment-method ${paymentMethod === method.id ? "active" : ""}`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <span className="payment-icon">{method.icon}</span>
                  <span>
                    <strong>{method.label}</strong>
                    <small>{method.description}</small>
                  </span>
                </button>
              ))}
            </div>

            {paymentMethod === "upi" && (
              <label className="upi-field">
                <span>UPI ID</span>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </label>
            )}

            <div className="checkout-footer">
              <p>Protected by Razorpay • UPI, cards, wallets, and net banking are supported.</p>
              <button type="button" className="plan-button btn-primary" onClick={handlePayment}>
                Pay securely now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Subscription;
