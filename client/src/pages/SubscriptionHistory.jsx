import { useEffect, useState } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

function SubscriptionHistory() {
  const [history, setHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/api/subscription/history`, { headers: getAuthHeaders() });
        setHistory(data.history || []);
        setInvoices(data.invoices || []);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="page"><Spinner /></div>;

  return (
    <div className="page subscription-history">
      <h2>Subscription History</h2>
      <section className="invoices">
        <h3>Invoices</h3>
        {invoices.length === 0 && <p>No invoices found.</p>}
        <ul>
          {invoices.map((inv) => (
            <li key={inv.invoiceId} className="invoice-item">
              <strong>{inv.plan}</strong> — {inv.amount / 100} {inv.currency} — {inv.status}
            </li>
          ))}
        </ul>
      </section>

      <section className="history">
        <h3>Events</h3>
        {history.length === 0 && <p>No history found.</p>}
        <ul>
          {history.map((h, idx) => (
            <li key={idx}>{new Date(h.createdAt).toLocaleString()} — {h.event} — {h.plan}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default SubscriptionHistory;
