import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    navigate("/login");
    window.location.reload();
  };

  return (
    <header className="navbar">
      <div className="logo">
        🎬 <span>StreamFlix</span>
      </div>

      <nav className="nav-links">
        <NavLink to="/" className="nav-item">
          Home
        </NavLink>

        <NavLink to="/subscription" className="nav-item subscription">
          Subscription
        </NavLink>

        {token ? (
          <>
            <NavLink to="/watchlist" className="nav-item">
              Watchlist
            </NavLink>

            <NavLink to="/profile" className="nav-item">
              Profile
            </NavLink>

            <button className="nav-item register-btn" onClick={logout}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="login-btn nav-item">
              Sign In
            </NavLink>
            <NavLink to="/register" className="register-btn nav-item">
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
