import { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Sparkles } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) return { label: "Create a strong password", tone: "muted" };
    if (password.length < 8) return { label: "Too short", tone: "error" };
    if (password.length < 12) return { label: "Good", tone: "warning" };
    return { label: "Strong", tone: "success" };
  }, [password]);

  const registerHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", res.data.accessToken || res.data.token);
      storage.setItem("refreshToken", res.data.refreshToken || "");
      storage.setItem("user", JSON.stringify(res.data.user));
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <section className="auth-panel glass">
        <div className="auth-header">
          <div className="brand-pill"><Sparkles size={14} /> StreamFlix</div>
          <h1>Create your account</h1>
          <p>Join StreamFlix and unlock unlimited movies, series, and premium content.</p>
        </div>

        <form className="auth-form" onSubmit={registerHandler}>
          {error ? <div className="form-message form-message--error">{error}</div> : null}

          <label className="input-field">
            <span>Name</span>
            <input type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label className="input-field">
            <span>Email</span>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label className="input-field">
            <span>Password</span>
            <div className="password-input">
              <input type={showPassword ? "text" : "password"} placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="icon-button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <small className={`strength ${passwordStrength.tone}`}>{passwordStrength.label}</small>
          </label>

          <label className="checkbox-label">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>

          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Creating account..." : "Start Free Trial"}</button>

          <div className="auth-divider"><span>or continue with</span></div>
          <div className="social-buttons">
            <button type="button" className="social-button">Google</button>
            <button type="button" className="social-button">GitHub</button>
          </div>

          <div className="auth-alt">Already have an account? <Link to="/login">Sign in</Link></div>
        </form>
      </section>

      <aside className="auth-showcase">
        <div className="hero-badge">Watch Together</div>
        <h2>Discover new releases, trending shows, and curated playlists in one place.</h2>
        <div className="feature-grid">
          <div><strong>Unlimited streaming</strong><p>Enjoy titles from every genre.</p></div>
          <div><strong>Curated collections</strong><p>Get recommendations for every mood.</p></div>
          <div><strong>Fast signup</strong><p>Start watching instantly with one account.</p></div>
        </div>
      </aside>
    </div>
  );
};

export default Register;