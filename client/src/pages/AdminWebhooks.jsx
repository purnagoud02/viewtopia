import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export default function AdminWebhooks() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/api/payment/webhooks`, { headers: getAuthHeaders() });
        setEvents(data.events || []);
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markProcessed = async (id) => {
    try {
      await axios.post(`${API_BASE}/api/payment/webhooks/${id}/mark`, {}, { headers: getAuthHeaders() });
      setEvents((e) => e.map((it) => (it._id === id ? { ...it, processed: true } : it)));
    } catch (err) {
      setError(err.message || 'Failed');
    }
  };

  return (
    <div className="page admin-webhooks">
      <h2>Webhook Events</h2>
      {error && <div className="glass" style={{ padding: 8, color: 'red' }}>{error}</div>}
      {loading && <div className="glass">Loading…</div>}
      {!loading && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Event</th>
              <th>When</th>
              <th>Processed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev._id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: 8, fontSize: 12 }}>{ev._id}</td>
                <td style={{ padding: 8 }}>{ev.event}</td>
                <td style={{ padding: 8 }}>{new Date(ev.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8 }}>{ev.processed ? 'Yes' : 'No'}</td>
                <td style={{ padding: 8 }}>
                  {!ev.processed && (
                    <button onClick={() => markProcessed(ev._id)} className="btn-secondary">Mark Processed</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
