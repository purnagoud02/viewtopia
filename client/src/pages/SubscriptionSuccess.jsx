import { Link, useSearchParams } from "react-router-dom";

export default function SubscriptionSuccess() {
  const [params] = useSearchParams();
  const plan = params.get("plan") || "premium";
  const provider = params.get("provider") || "payment";

  return (
    <div className="page subscription-page">
      <section className="subscription-hero">
        <h1>Payment Confirmed</h1>
        <p>Your premium access is now active for the {plan} plan via {provider}.</p>
      </section>
      <div className="subscription-status glass">
        <p>✅ Your payment was successful. Premium features are now unlocked.</p>
      </div>
      <div className="subscription-actions">
        <Link className="plan-button btn-primary" to="/home">Continue Watching</Link>
        <Link className="plan-button btn-secondary" to="/profile">View Subscription</Link>
      </div>
    </div>
  );
}
