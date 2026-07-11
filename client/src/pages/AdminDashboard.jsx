import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const emptyMovieForm = {
  title: "",
  description: "",
  genre: "",
  poster: "",
  backdrop: "",
  cast: "",
  director: "",
  runtime: "",
  rating: "",
  releaseDate: "",
  trailer: "",
  year: "",
  videoUrl: "",
};

const emptyTvForm = {
  title: "",
  description: "",
  genre: "",
  poster: "",
  backdrop: "",
  trailer: "",
  videoUrl: "",
  year: "",
  seasons: "",
  type: "Series",
  rating: "",
};

const emptyCategoryForm = { name: "", description: "", slug: "" };
const emptySubscriptionForm = { userId: "", plan: "free", billingCycle: "monthly", status: "active", autoRenew: true, notes: "" };
const emptyReviewForm = { movieId: "", userId: "", rating: 5, comment: "" };
const emptyReportForm = { title: "", type: "general", details: "", status: "open" };
const emptyBannerForm = { title: "", image: "", link: "", active: true };
const emptyNotificationForm = { title: "", message: "", active: true };

function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [banners, setBanners] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [movieForm, setMovieForm] = useState(emptyMovieForm);
  const [tvForm, setTvForm] = useState(emptyTvForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [subscriptionForm, setSubscriptionForm] = useState(emptySubscriptionForm);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);
  const [reportForm, setReportForm] = useState(emptyReportForm);
  const [bannerForm, setBannerForm] = useState(emptyBannerForm);
  const [notificationForm, setNotificationForm] = useState(emptyNotificationForm);
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editBannerId, setEditBannerId] = useState("");
  const [editTvShowId, setEditTvShowId] = useState("");
  const [editNotificationId, setEditNotificationId] = useState("");
  const isAdmin = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null")?.role === "admin";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [overviewRes, moviesRes, tvRes, categoriesRes, subscriptionsRes, reviewsRes, reportsRes, bannersRes, notificationsRes, logsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/overview`, { headers }),
        axios.get(`${API_BASE}/api/movies`),
        axios.get(`${API_BASE}/api/admin/tvshows`, { headers }),
        axios.get(`${API_BASE}/api/admin/categories`, { headers }),
        axios.get(`${API_BASE}/api/admin/subscriptions`, { headers }),
        axios.get(`${API_BASE}/api/admin/reviews`, { headers }),
        axios.get(`${API_BASE}/api/admin/reports`, { headers }),
        axios.get(`${API_BASE}/api/admin/banners`, { headers }),
        axios.get(`${API_BASE}/api/admin/notifications`, { headers }),
        axios.get(`${API_BASE}/api/admin/logs`, { headers }),
      ]);
      setOverview(overviewRes.data);
      setMovies(moviesRes.data || []);
      setTvShows(tvRes.data || []);
      setCategories(categoriesRes.data || []);
      setSubscriptions(subscriptionsRes.data || []);
      setReviews(reviewsRes.data || []);
      setReports(reportsRes.data || []);
      setBanners(bannersRes.data || []);
      setNotifications(notificationsRes.data || []);
      setLogs(logsRes.data || []);
    } catch {
      setOverview({ metrics: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    const timer = window.setTimeout(() => {
      void loadAdminData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isAdmin]);

  const metrics = useMemo(() => overview?.metrics || {}, [overview]);

  const submitMovie = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/movies`, { ...movieForm, year: Number(movieForm.year) }, { headers: getAuthHeaders() });
      setMovieForm(emptyMovieForm);
      loadAdminData();
      alert("Movie uploaded successfully");
    } catch {
      alert("Failed to upload movie");
    }
  };

  const deleteMovie = async (id) => {
    if (!window.confirm("Delete this movie?")) return;
    try {
      await axios.delete(`${API_BASE}/api/movies/${id}`, { headers: getAuthHeaders() });
      loadAdminData();
    } catch {
      alert("Failed to delete movie");
    }
  };

  const submitTvShow = async (event) => {
    event.preventDefault();
    try {
      if (editTvShowId) {
        await axios.put(`${API_BASE}/api/admin/tvshows/${editTvShowId}`, { ...tvForm, year: Number(tvForm.year), seasons: Number(tvForm.seasons) }, { headers: getAuthHeaders() });
      } else {
        await axios.post(`${API_BASE}/api/admin/tvshows`, { ...tvForm, year: Number(tvForm.year), seasons: Number(tvForm.seasons) }, { headers: getAuthHeaders() });
      }
      setTvForm(emptyTvForm);
      setEditTvShowId("");
      loadAdminData();
    } catch {
      alert("Failed to save TV show");
    }
  };

  const editTvShow = (show) => {
    setEditTvShowId(show._id);
    setTvForm({ ...show, year: show.year || "", seasons: show.seasons || "" });
  };

  const deleteTvShow = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/tvshows/${id}`, { headers: getAuthHeaders() });
      loadAdminData();
    } catch {
      alert("Failed to delete TV show");
    }
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    try {
      if (editCategoryId) {
        await axios.put(`${API_BASE}/api/admin/categories/${editCategoryId}`, categoryForm, { headers: getAuthHeaders() });
      } else {
        await axios.post(`${API_BASE}/api/admin/categories`, categoryForm, { headers: getAuthHeaders() });
      }
      setCategoryForm(emptyCategoryForm);
      setEditCategoryId("");
      loadAdminData();
    } catch {
      alert("Failed to save category");
    }
  };

  const editCategory = (category) => {
    setEditCategoryId(category._id);
    setCategoryForm({ name: category.name || "", description: category.description || "", slug: category.slug || "" });
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/categories/${id}`, { headers: getAuthHeaders() });
      loadAdminData();
    } catch {
      alert("Failed to delete category");
    }
  };

  const submitSubscription = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/admin/subscriptions`, subscriptionForm, { headers: getAuthHeaders() });
      setSubscriptionForm(emptySubscriptionForm);
      loadAdminData();
    } catch {
      alert("Failed to save subscription");
    }
  };

  const deleteSubscription = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/subscriptions/${id}`, { headers: getAuthHeaders() });
      loadAdminData();
    } catch {
      alert("Failed to delete subscription");
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/admin/reviews`, reviewForm, { headers: getAuthHeaders() });
      setReviewForm(emptyReviewForm);
      loadAdminData();
    } catch {
      alert("Failed to save review");
    }
  };

  const deleteReview = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/reviews/${id}`, { headers: getAuthHeaders() });
      loadAdminData();
    } catch {
      alert("Failed to delete review");
    }
  };

  const submitReport = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/admin/reports`, reportForm, { headers: getAuthHeaders() });
      setReportForm(emptyReportForm);
      loadAdminData();
    } catch {
      alert("Failed to save report");
    }
  };

  const deleteReport = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/reports/${id}`, { headers: getAuthHeaders() });
      loadAdminData();
    } catch {
      alert("Failed to delete report");
    }
  };

  const submitBanner = async (event) => {
    event.preventDefault();
    try {
      if (editBannerId) {
        await axios.put(`${API_BASE}/api/admin/banners/${editBannerId}`, bannerForm, { headers: getAuthHeaders() });
      } else {
        await axios.post(`${API_BASE}/api/admin/banners`, bannerForm, { headers: getAuthHeaders() });
      }
      setBannerForm(emptyBannerForm);
      setEditBannerId("");
      loadAdminData();
    } catch {
      alert("Failed to save banner");
    }
  };

  const editBanner = (banner) => {
    setEditBannerId(banner._id);
    setBannerForm({ title: banner.title || "", image: banner.image || "", link: banner.link || "", active: banner.active !== false });
  };

  const deleteBanner = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/banners/${id}`, { headers: getAuthHeaders() });
      loadAdminData();
    } catch {
      alert("Failed to delete banner");
    }
  };

  const submitNotification = async (event) => {
    event.preventDefault();
    try {
      if (editNotificationId) {
        await axios.put(`${API_BASE}/api/admin/notifications/${editNotificationId}`, notificationForm, { headers: getAuthHeaders() });
      } else {
        await axios.post(`${API_BASE}/api/admin/notifications`, notificationForm, { headers: getAuthHeaders() });
      }
      setNotificationForm(emptyNotificationForm);
      setEditNotificationId("");
      loadAdminData();
    } catch {
      alert("Failed to save notification");
    }
  };

  const editNotification = (item) => {
    setEditNotificationId(item._id);
    setNotificationForm({ title: item.title || "", message: item.message || "", active: item.active !== false });
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/notifications/${id}`, { headers: getAuthHeaders() });
      loadAdminData();
    } catch {
      alert("Failed to delete notification");
    }
  };

  if (!isAdmin) {
    return <div className="page detail-empty">Access denied. Admin access is required.</div>;
  }

  if (loading) {
    return <div className="page detail-empty">Loading dashboard...</div>;
  }

  return (
    <div className="page" style={{ paddingBottom: "80px" }}>
      <div className="glass" style={{ padding: "28px", borderRadius: "24px" }}>
        <h1>🎛️ Admin Dashboard</h1>
        <p>Manage your media library, users, subscriptions, reviews, reports, banners, notifications, and logs from one place.</p>

        <div className="profile-stats" style={{ marginTop: "24px" }}>
          {[
            ["Movies", metrics.movies || 0],
            ["TV Shows", metrics.shows || 0],
            ["Categories", metrics.categories || 0],
            ["Users", metrics.users || 0],
            ["Subscriptions", metrics.subscriptions || 0],
            ["Reviews", metrics.reviews || 0],
            ["Reports", metrics.reports || 0],
            ["Banners", metrics.banners || 0],
            ["Notifications", metrics.notifications || 0],
            ["Logs", metrics.logs || 0],
          ].map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </div>

        <div className="detail-panel__card" style={{ marginTop: "24px" }}>
          <h2>Analytics & Revenue</h2>
          <p>Estimated revenue: ${metrics.revenue || 0}</p>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", minHeight: "140px", marginTop: "12px" }}>
            {[
              ["Active", metrics.activeSubscriptions || 0],
              ["Premium", metrics.premiumSubscriptions || 0],
              ["Monthly", metrics.monthlySubscriptions || 0],
              ["Yearly", metrics.yearlySubscriptions || 0],
            ].map(([label, value]) => (
              <div key={label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: `${Math.max(20, value * 10)}px`, background: "linear-gradient(135deg, #e50914, #f59e0b)", borderRadius: "8px 8px 0 0" }} />
                <div style={{ marginTop: "6px", color: "#ccc" }}>{label}</div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-panels" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: "24px" }}>
          <div className="detail-panel__card" id="upload">
            <h2>Movie Upload</h2>
            <form onSubmit={submitMovie} style={{ display: "grid", gap: "8px" }}>
              <input value={movieForm.title} onChange={(event) => setMovieForm({ ...movieForm, title: event.target.value })} placeholder="Title" required />
              <input value={movieForm.genre} onChange={(event) => setMovieForm({ ...movieForm, genre: event.target.value })} placeholder="Genre" required />
              <input value={movieForm.poster} onChange={(event) => setMovieForm({ ...movieForm, poster: event.target.value })} placeholder="Poster URL" />
              <input value={movieForm.backdrop} onChange={(event) => setMovieForm({ ...movieForm, backdrop: event.target.value })} placeholder="Backdrop URL" />
              <input value={movieForm.videoUrl} onChange={(event) => setMovieForm({ ...movieForm, videoUrl: event.target.value })} placeholder="Video URL" />
              <input value={movieForm.trailer} onChange={(event) => setMovieForm({ ...movieForm, trailer: event.target.value })} placeholder="Trailer URL" />
              <textarea value={movieForm.description} onChange={(event) => setMovieForm({ ...movieForm, description: event.target.value })} placeholder="Description" rows="4" />
              <button className="btn-primary" type="submit">Upload Movie</button>
            </form>
          </div>

          <div className="detail-panel__card" id="movies">
            <h2>Movie Management</h2>
            <div style={{ display: "grid", gap: "10px" }}>
              {movies.map((movie) => <div key={movie._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <span>{movie.title}</span>
                <span>
                  <Link to={`/admin/edit/${movie._id}`}><button className="btn-secondary" type="button">Edit</button></Link>
                  <button className="btn-primary" type="button" onClick={() => deleteMovie(movie._id)} style={{ marginLeft: "6px" }}>Delete</button>
                </span>
              </div>)}
            </div>
          </div>
        </div>

        <div className="profile-panels" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: "24px" }}>
          <div className="detail-panel__card" id="tvshows">
            <h2>TV Show Management</h2>
            <form onSubmit={submitTvShow} style={{ display: "grid", gap: "8px" }}>
              <input value={tvForm.title} onChange={(event) => setTvForm({ ...tvForm, title: event.target.value })} placeholder="Title" required />
              <input value={tvForm.genre} onChange={(event) => setTvForm({ ...tvForm, genre: event.target.value })} placeholder="Genre" />
              <input value={tvForm.poster} onChange={(event) => setTvForm({ ...tvForm, poster: event.target.value })} placeholder="Poster URL" />
              <input value={tvForm.videoUrl} onChange={(event) => setTvForm({ ...tvForm, videoUrl: event.target.value })} placeholder="Video URL" />
              <input value={tvForm.trailer} onChange={(event) => setTvForm({ ...tvForm, trailer: event.target.value })} placeholder="Trailer URL" />
              <textarea value={tvForm.description} onChange={(event) => setTvForm({ ...tvForm, description: event.target.value })} placeholder="Description" rows="3" />
              <button className="btn-primary" type="submit">{editTvShowId ? "Update TV Show" : "Add TV Show"}</button>
            </form>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              {tvShows.map((show) => <div key={show._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <span>{show.title}</span>
                <span><button className="btn-secondary" type="button" onClick={() => editTvShow(show)}>Edit</button><button className="btn-primary" type="button" onClick={() => deleteTvShow(show._id)} style={{ marginLeft: "6px" }}>Delete</button></span>
              </div>)}
            </div>
          </div>

          <div className="detail-panel__card" id="categories">
            <h2>Category Management</h2>
            <form onSubmit={submitCategory} style={{ display: "grid", gap: "8px" }}>
              <input value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} placeholder="Category name" required />
              <input value={categoryForm.slug} onChange={(event) => setCategoryForm({ ...categoryForm, slug: event.target.value })} placeholder="Slug" />
              <textarea value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} placeholder="Description" rows="3" />
              <button className="btn-primary" type="submit">{editCategoryId ? "Update Category" : "Add Category"}</button>
            </form>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              {categories.map((category) => <div key={category._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <span>{category.name}</span>
                <span><button className="btn-secondary" type="button" onClick={() => editCategory(category)}>Edit</button><button className="btn-primary" type="button" onClick={() => deleteCategory(category._id)} style={{ marginLeft: "6px" }}>Delete</button></span>
              </div>)}
            </div>
          </div>
        </div>

        <div className="profile-panels" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: "24px" }}>
          <div className="detail-panel__card" id="users">
            <h2>User Management</h2>
            <div style={{ display: "grid", gap: "10px" }}>
              {subscriptions.slice(0, 8).map((item) => <div key={item._id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "8px 0" }}>
                <span>{item.userId?.name || item.userId?.email || item.userId}</span>
                <span>{item.plan} · {item.status}</span>
              </div>)}
            </div>
          </div>
          <div className="detail-panel__card" id="subscriptions">
            <h2>Subscription Management</h2>
            <form onSubmit={submitSubscription} style={{ display: "grid", gap: "8px" }}>
              <input value={subscriptionForm.userId} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, userId: event.target.value })} placeholder="User ID" required />
              <select value={subscriptionForm.plan} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, plan: event.target.value })}>
                <option value="free">Free</option><option value="basic">Basic</option><option value="premium">Premium</option>
              </select>
              <select value={subscriptionForm.billingCycle} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, billingCycle: event.target.value })}>
                <option value="monthly">Monthly</option><option value="yearly">Yearly</option>
              </select>
              <select value={subscriptionForm.status} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, status: event.target.value })}>
                <option value="active">Active</option><option value="cancelled">Cancelled</option><option value="expired">Expired</option>
              </select>
              <textarea value={subscriptionForm.notes} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, notes: event.target.value })} placeholder="Notes" rows="3" />
              <button className="btn-primary" type="submit">Add Subscription</button>
            </form>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              {subscriptions.map((item) => <div key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <span>{item.plan} · {item.status}</span>
                <button className="btn-primary" type="button" onClick={() => deleteSubscription(item._id)}>Delete</button>
              </div>)}
            </div>
          </div>
        </div>

        <div className="profile-panels" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: "24px" }}>
          <div className="detail-panel__card" id="reviews">
            <h2>Reviews</h2>
            <form onSubmit={submitReview} style={{ display: "grid", gap: "8px" }}>
              <input value={reviewForm.movieId} onChange={(event) => setReviewForm({ ...reviewForm, movieId: event.target.value })} placeholder="Movie ID" required />
              <input value={reviewForm.userId} onChange={(event) => setReviewForm({ ...reviewForm, userId: event.target.value })} placeholder="User ID" required />
              <input type="number" min="1" max="5" value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: Number(event.target.value) })} />
              <textarea value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} placeholder="Comment" rows="3" />
              <button className="btn-primary" type="submit">Add Review</button>
            </form>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              {reviews.map((item) => <div key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <span>{item.comment || "Review"}</span>
                <button className="btn-primary" type="button" onClick={() => deleteReview(item._id)}>Delete</button>
              </div>)}
            </div>
          </div>
          <div className="detail-panel__card" id="reports">
            <h2>Reports</h2>
            <form onSubmit={submitReport} style={{ display: "grid", gap: "8px" }}>
              <input value={reportForm.title} onChange={(event) => setReportForm({ ...reportForm, title: event.target.value })} placeholder="Report title" required />
              <input value={reportForm.type} onChange={(event) => setReportForm({ ...reportForm, type: event.target.value })} placeholder="Type" />
              <textarea value={reportForm.details} onChange={(event) => setReportForm({ ...reportForm, details: event.target.value })} placeholder="Details" rows="3" />
              <select value={reportForm.status} onChange={(event) => setReportForm({ ...reportForm, status: event.target.value })}>
                <option value="open">Open</option><option value="reviewed">Reviewed</option><option value="resolved">Resolved</option>
              </select>
              <button className="btn-primary" type="submit">Add Report</button>
            </form>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              {reports.map((item) => <div key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <span>{item.title}</span>
                <button className="btn-primary" type="button" onClick={() => deleteReport(item._id)}>Delete</button>
              </div>)}
            </div>
          </div>
        </div>

        <div className="profile-panels" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: "24px" }}>
          <div className="detail-panel__card" id="banners">
            <h2>Banner Management</h2>
            <form onSubmit={submitBanner} style={{ display: "grid", gap: "8px" }}>
              <input value={bannerForm.title} onChange={(event) => setBannerForm({ ...bannerForm, title: event.target.value })} placeholder="Banner title" required />
              <input value={bannerForm.image} onChange={(event) => setBannerForm({ ...bannerForm, image: event.target.value })} placeholder="Image URL" required />
              <input value={bannerForm.link} onChange={(event) => setBannerForm({ ...bannerForm, link: event.target.value })} placeholder="Link" />
              <label><input type="checkbox" checked={bannerForm.active} onChange={(event) => setBannerForm({ ...bannerForm, active: event.target.checked })} /> Active</label>
              <button className="btn-primary" type="submit">{editBannerId ? "Update Banner" : "Add Banner"}</button>
            </form>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              {banners.map((banner) => <div key={banner._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <span>{banner.title}</span>
                <span><button className="btn-secondary" type="button" onClick={() => editBanner(banner)}>Edit</button><button className="btn-primary" type="button" onClick={() => deleteBanner(banner._id)} style={{ marginLeft: "6px" }}>Delete</button></span>
              </div>)}
            </div>
          </div>

          <div className="detail-panel__card" id="notifications">
            <h2>Notifications</h2>
            <form onSubmit={submitNotification} style={{ display: "grid", gap: "8px" }}>
              <input value={notificationForm.title} onChange={(event) => setNotificationForm({ ...notificationForm, title: event.target.value })} placeholder="Title" required />
              <textarea value={notificationForm.message} onChange={(event) => setNotificationForm({ ...notificationForm, message: event.target.value })} placeholder="Message" rows="3" required />
              <label><input type="checkbox" checked={notificationForm.active} onChange={(event) => setNotificationForm({ ...notificationForm, active: event.target.checked })} /> Active</label>
              <button className="btn-primary" type="submit">{editNotificationId ? "Update Notification" : "Add Notification"}</button>
            </form>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              {notifications.map((item) => <div key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <span>{item.title}</span>
                <span><button className="btn-secondary" type="button" onClick={() => editNotification(item)}>Edit</button><button className="btn-primary" type="button" onClick={() => deleteNotification(item._id)} style={{ marginLeft: "6px" }}>Delete</button></span>
              </div>)}
            </div>
          </div>
        </div>

        <div className="detail-panel__card" id="logs" style={{ marginTop: "24px" }}>
          <h2>Logs</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {logs.slice(0, 10).map((log) => <div key={log._id} style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>{log.action} · {new Date(log.createdAt).toLocaleString()}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;