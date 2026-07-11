import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Film, Sparkles, TrendingUp, Tv, Compass } from "lucide-react";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import movieCatalog from "../data/movieCatalog";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function Home() {
  const [movies, setMovies] = useState(() => {
    const cached = sessionStorage.getItem("viewtopia-movies");
    if (!cached) return movieCatalog;
    try {
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) && parsed.length ? parsed : movieCatalog;
    } catch {
      return movieCatalog;
    }
  });
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [loading, setLoading] = useState(() => !sessionStorage.getItem("viewtopia-movies"));

  useEffect(() => {
    const cached = sessionStorage.getItem("viewtopia-movies");
    if (cached) {
      const handler = window.setTimeout(() => setLoading(false), 0);
      return () => window.clearTimeout(handler);
    }
    const savedProgress = JSON.parse(localStorage.getItem("viewtopia-watch-progress") || "{}");

    const fetchMovies = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_BASE}/api/movies`, { headers });
        const nextMovies = Array.isArray(res.data) && res.data.length ? res.data : movieCatalog;
        // Merge local watch progress into movie objects so Continue Watching shows correctly
        const merged = nextMovies.map((m) => ({ ...m, progress: savedProgress[m._id] ? (savedProgress[m._id] / (m.runtime || m.duration || 1)) * 100 : m.progress || 0 }));
        setMovies(merged);
        sessionStorage.setItem("viewtopia-movies", JSON.stringify(nextMovies));
      } catch {
        const merged = movieCatalog.map((m) => ({ ...m, progress: savedProgress[m._id] ? (savedProgress[m._id] / (m.runtime || m.duration || 1)) * 100 : m.progress || 0 }));
        setMovies(merged);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const bySearch = normalizedSearch
      ? movies.filter((movie) => {
          const title = movie.title?.toLowerCase() ?? "";
          const genre = (movie.genre || movie.genres?.join(" ") || "").toLowerCase();
          const cast = (movie.cast || []).join(" ").toLowerCase();
          return title.includes(normalizedSearch) || genre.includes(normalizedSearch) || cast.includes(normalizedSearch);
        })
      : movies;

    return activeGenre === "All" ? bySearch : bySearch.filter((movie) => {
      const movieGenres = [movie.genre, ...(movie.genres || [])].filter(Boolean);
      return movieGenres.includes(activeGenre);
    });
  }, [movies, search, activeGenre]);

  const featuredMovie = filteredMovies[0] || movies[0];
  const trendingMovies = filteredMovies.filter((movie) => movie.status === "trending").slice(0, 8);
  const popularMovies = filteredMovies.filter((movie) => movie.status === "popular").slice(0, 8);
  const latestMovies = filteredMovies.filter((movie) => movie.status === "latest").slice(0, 8);
  const upcomingMovies = filteredMovies.filter((movie) => movie.status === "upcoming").slice(0, 8);
  const topRatedMovies = filteredMovies.filter((movie) => movie.rating >= 8).slice(0, 8);
  const genres = Array.from(new Set(movies.flatMap((m) => [m.genre, ...(m.genres || [])]).filter(Boolean)));

  return (
    <div className="page home-page">
      {featuredMovie && <HeroBanner movie={featuredMovie} />}

      <main className="home-content">
        <section className="hero-strip glass">
          <div>
            <p className="eyebrow">Featured Collection</p>
            <h2>Premium stories, cinematic visuals, and endless binge-worthy picks.</h2>
            <p className="hero-strip-copy">Explore live collections, trending originals, and curated moods tailored to your next movie night.</p>
          </div>
          <div className="hero-strip-actions">
            <Link to="/subscription" className="btn-primary">Upgrade to Premium</Link>
            <Link to="/watchlist" className="btn-secondary">View Watchlist</Link>
          </div>
        </section>

        <section className="quick-stats glass">
          {[
            { icon: TrendingUp, label: "Trending", value: "4K+ titles" },
            { icon: Film, label: "Curated", value: "New releases" },
            { icon: Tv, label: "Devices", value: "4 screens" },
            { icon: Compass, label: "Smart", value: "AI picks" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="stat-pill">
              <Icon size={18} />
              <div>
                <strong>{label}</strong>
                <span>{value}</span>
              </div>
            </div>
          ))}
        </section>

        <Section title="Trending Now" movies={trendingMovies} loading={loading} />
        <Section title="Popular Picks" movies={popularMovies} loading={loading} />
        <Section title="Top Rated" movies={topRatedMovies} loading={loading} />
        <Section title="Latest Releases" movies={latestMovies} loading={loading} />
        <Section title="Upcoming" movies={upcomingMovies} loading={loading} />

        {/* Continue Watching row: uses progress property if available in movie data */}
        <section className="movie-section continue-section">
          <div className="section-header">
            <div>
              <h2>Continue Watching</h2>
              <p>Resume from where you left off.</p>
            </div>
            <div />
          </div>

          <div className="row-carousel row-carousel--compact">
            {(movies.filter((m) => m.progress).length ? movies.filter((m) => m.progress) : movies.slice(0, 8)).map((movie) => (
              <MovieCard key={movie._id || movie.title} movie={movie} />
            ))}
          </div>
        </section>

        {/* Curated Top Movies */}
        <section className="movie-section top-movies">
          <div className="section-header">
            <div>
              <h2>Top Movies</h2>
              <p>Critically acclaimed and editor picks.</p>
            </div>
            <div />
          </div>
          <div className="row-carousel">
            {movies
              .slice()
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, 12)
              .map((movie, idx) => (
                <MovieCard key={movie._id || movie.title} movie={movie} position={idx + 1} />
              ))}
          </div>
        </section>

        <section className="movie-section">
          <div className="section-header">
            <div>
              <h2>Browse by Genre</h2>
              <p>Jump into the mood you want to watch tonight.</p>
            </div>
            <div className="search-shell">
              <SearchBar search={search} setSearch={setSearch} />
            </div>
          </div>
          <div className="genre-chips">
            <button className={`chip ${activeGenre === "All" ? "active" : ""}`} onClick={() => setActiveGenre("All")}>All</button>
            {genres.map((genre) => (
              <button key={genre} className={`chip ${activeGenre === genre ? "active" : ""}`} onClick={() => setActiveGenre(genre)}>{genre}</button>
            ))}
          </div>
          <div className="row-carousel">
            {filteredMovies.slice(0, 12).map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function HeroBanner({ movie }) {
  const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
  const poster = movie.poster?.startsWith("/uploads") ? `${API_BASE}${movie.poster}` : movie.poster;

  return (
    <section
      className="hero-banner-featured"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(5, 5, 10, 0.9) 0%, rgba(5, 5, 10, 0.55) 55%), url(${poster})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="hero-banner-content">
        <div className="hero-info">
          {movie.genre && <span className="hero-badge">{movie.genre}</span>}
          <h1 className="hero-title">{movie.title}</h1>
          <div className="hero-metadata">
            {movie.rating && <span className="hero-rating">⭐ {movie.rating}</span>}
            {movie.year && <span className="hero-year">{movie.year}</span>}
            {movie.runtime && <span className="hero-duration">{movie.runtime} min</span>}
          </div>
          <p className="hero-description">{movie.description}</p>
          <div className="hero-actions">
            <Link to={`/watch/${movie._id}`} className="btn-primary hero-play">▶ Play now</Link>
            <Link to={`/movie/${movie._id}`} className="btn-secondary">More info</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Section({ title, movies, loading }) {
  const placeholders = Array.from({ length: 6 });

  return (
    <section className="movie-section">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          <p>Fresh picks and premium titles from the collection.</p>
        </div>
      </div>

      {loading ? (
        <div className="row-carousel">
          {placeholders.map((_, index) => (
            <div key={index} className="skeleton-card" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="empty-state">No movies found for this selection.</div>
      ) : (
        <div className="row-carousel">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Home;