import { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Sparkles } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) return { label: "Enter your password", tone: "muted" };
    if (password.length < 8) return { label: "Too short", tone: "error" };
    if (password.length < 12) return { label: "Good", tone: "warning" };
    return { label: "Strong", tone: "success" };
  }, [password]);

  const loginHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", res.data.accessToken || res.data.token);
      storage.setItem("refreshToken", res.data.refreshToken || "");
      storage.setItem("user", JSON.stringify(res.data.user));
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const requestReset = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email: resetEmail });
      setMessage(res.data.message || "Check your inbox for reset instructions.");
    } catch {
      setMessage("Unable to process reset request right now.");
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel glass">
        <div className="auth-header">
          <div className="brand-pill"><Sparkles size={14} /> StreamFlix</div>
          <h1>Welcome back</h1>
          <p>Sign in to resume your watchlist, premium movies, and smart recommendations.</p>
        </div>

        <form className="auth-form" onSubmit={loginHandler}>
          {error ? <div className="form-message form-message--error">{error}</div> : null}
          {message ? <div className="form-message form-message--success">{message}</div> : null}

          <label className="input-field">
            <span>Email</span>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label className="input-field">
            <span>Password</span>
            <div className="password-input">
              <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="icon-button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <small className={`strength ${passwordStrength.tone}`}>{passwordStrength.label}</small>
          </label>

          <div className="auth-row">
            <label className="checkbox-label">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <button type="button" className="auth-link" onClick={() => setForgot((value) => !value)}>
              Forgot password?
            </button>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>

          <div className="auth-divider"><span>or continue with</span></div>
          <div className="social-buttons">
            <button type="button" className="social-button">Google</button>
            <button type="button" className="social-button">GitHub</button>
          </div>

          <div className="auth-alt">New to StreamFlix? <Link to="/register">Create account</Link></div>

          {forgot && (
            <form className="auth-form auth-form--compact" onSubmit={requestReset}>
              <label className="input-field">
                <span>Reset email</span>
                <input type="email" placeholder="Enter your email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
              </label>
              <button className="btn-secondary" type="submit">Send Reset Link</button>
            </form>
          )}
        </form>
      </section>

      <aside className="auth-showcase">
        <div className="hero-badge">Premium</div>
        <h2>Stream iconic releases, curated collections, and binge-worthy originals.</h2>
        <div className="feature-grid">
          <div><strong>Unlimited access</strong><p>Watch premium titles from any screen.</p></div>
          <div><strong>Curated picks</strong><p>Discover recommendations tuned to your mood.</p></div>
          <div><strong>Multi-screen</strong><p>Resume from the exact moment you left off.</p></div>
        </div>
      </aside>
    </div>
  );
};

export default Login;