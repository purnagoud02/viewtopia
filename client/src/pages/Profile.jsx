import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
  const [user, setUser] = useState(storedUser);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [avatarFile, setAvatarFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const [watchlistRes, historyRes, favoritesRes, notificationsRes, subscriptionRes, invoicesRes] = await Promise.all([
          axios.get(`${API_BASE}/api/watchlist/${storedUser?._id}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/api/auth/watch-history`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/api/auth/favorites`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/api/auth/notifications`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/api/subscription/`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null })),
          axios.get(`${API_BASE}/api/subscription/invoices`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
        ]);
        setWatchlistCount(Array.isArray(watchlistRes.data) ? watchlistRes.data.length : 0);
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
        setFavorites(Array.isArray(favoritesRes.data) ? favoritesRes.data : []);
        setNotifications(Array.isArray(notificationsRes.data) ? notificationsRes.data : []);
        setSubscription(subscriptionRes.data);
        setInvoices(Array.isArray(invoicesRes.data) ? invoicesRes.data : []);
      } catch {
        setWatchlistCount(0);
      }
    };

    if (storedUser?._id) {
      fetchProfileData();
    }
  }, [storedUser?._id]);

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      setAvatarError(false);
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const { data } = await axios.post(`${API_BASE}/api/upload/avatar`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
      const updatedUser = { ...user, avatar: data.avatar };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    } catch {
      setAvatarError(true);
    }
  };

  if (!user) {
    return <div className="page detail-empty">Please login first</div>;
  }

  return (
    <div className="page profile-page">
      <div className="profile-card glass">
        <div className="profile-card__header">
          <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
          <div className="profile-avatar-wrap">
            {user.avatar ? <img className="profile-avatar" src={user.avatar.startsWith("http") ? user.avatar : `${API_BASE}${user.avatar}`} alt="avatar" /> : <div className="profile-avatar placeholder">{user.name?.[0]}</div>}
          </div>
        </div>

        <div className="profile-stats">
          <div><strong>{watchlistCount}</strong><span>Watchlist</span></div>
          <div><strong>{history.length}</strong><span>History</span></div>
          <div><strong>{favorites.length}</strong><span>Favorites</span></div>
          <div><strong>{notifications.filter((item) => !item.read).length}</strong><span>Unread</span></div>
        </div>

        <input type="file" accept="image/*" onChange={(event) => setAvatarFile(event.target.files?.[0] || null)} />
        <button className="btn-primary" onClick={uploadAvatar}>Upload Avatar</button>
        {avatarError && <p className="detail-empty">Avatar upload is unavailable right now. Please try again later.</p>}
      </div>

      <div className="profile-panels">
        <div className="detail-panel__card">
          <h2>Continue Watching</h2>
          {history.length === 0 ? <p>No watch history yet.</p> : history.map((item) => <p key={item.movieId || item._id}>{item.title || item.name || "Recently viewed"}</p>)}
        </div>
        <div className="detail-panel__card">
          <h2>Favorites</h2>
          {favorites.length === 0 ? <p>No favorites yet.</p> : favorites.map((item) => <p key={item._id || item.movieId}>{item.title || item.name || "Favorite"}</p>)}
        </div>
        <div className="detail-panel__card">
          <h2>Subscription</h2>
          {subscription ? <><p><strong>Plan:</strong> {subscription.plan}</p><p><strong>Status:</strong> {subscription.status}</p><p><strong>Renews:</strong> {subscription.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : "N/A"}</p></> : <p>No subscription found.</p>}
        </div>
        <div className="detail-panel__card">
          <h2>Invoices</h2>
          {invoices.length === 0 ? <p>No invoices yet.</p> : invoices.map((invoice, index) => <p key={`${invoice.invoiceId || index}`}>{invoice.invoiceId || `Invoice ${index + 1}`} • ₹{invoice.amount / 100 || invoice.amount}</p>)}
        </div>
        <div className="detail-panel__card">
          <h2>Notifications</h2>
          {notifications.length === 0 ? <p>No notifications yet.</p> : notifications.map((item, index) => <p key={`${item.title}-${index}`}>{item.title}: {item.message}</p>)}
        </div>
      </div>
    </div>
  );
}

export default Profile;