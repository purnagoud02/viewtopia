import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, Moon, Search, Star, SunMedium, User } from "lucide-react";

export default function PremiumNavbar() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("viewtopia-theme") || "dark");
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("viewtopia-theme", theme);
  }, [theme]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    navigate("/login");
    window.location.reload();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl px-6 py-4 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 text-lg font-black text-white shadow-xl shadow-pink-500/25">
            SF
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">StreamFlix</p>
            <p className="text-sm font-semibold text-white">Premium OTT Experience</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className="text-sm font-medium text-slate-300 hover:text-white">Home</NavLink>
          <NavLink to="/subscription" className="text-sm font-medium text-slate-300 hover:text-white">Plans</NavLink>
          <NavLink to="/watchlist" className="text-sm font-medium text-slate-300 hover:text-white">Watchlist</NavLink>
          <NavLink to="/profile" className="text-sm font-medium text-slate-300 hover:text-white">Profile</NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))} className="rounded-full bg-white/10 p-3 text-slate-200 transition hover:bg-white/15" aria-label="Toggle theme">
            {theme === "dark" ? <SunMedium size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => navigate("/home")} className="rounded-full bg-white/10 p-3 text-slate-200 transition hover:bg-white/15" aria-label="Go to home">
            <Search size={18} />
          </button>
          <button onClick={() => navigate("/profile")} className="rounded-full bg-white/10 p-3 text-slate-200 transition hover:bg-white/15" aria-label="Open profile">
            <Bell size={18} />
          </button>
          {token ? (
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
              <User size={16} /> Sign out
            </button>
          ) : (
            <button onClick={() => navigate("/login")} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
              <Star size={16} /> Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
