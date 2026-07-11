import { Link, useSearchParams } from "react-router-dom";

export default function SubscriptionFailure() {
  const [params] = useSearchParams();
  const reason = params.get("reason") || "Payment was cancelled or could not be completed.";

  return (
    <div className="page subscription-page">
      <section className="subscription-hero">
        <h1>Payment Not Completed</h1>
        <p>Your account stays on the free plan until payment is confirmed.</p>
      </section>
      <div className="subscription-error glass">
        <p>⚠️ {reason}</p>
      </div>
      <div className="subscription-actions">
        <Link className="plan-button btn-primary" to="/subscription">Try Again</Link>
        <Link className="plan-button btn-secondary" to="/home">Return Home</Link>
      </div>
    </div>
  );
}
