import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function Banner() {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    let isMounted = true;

    axios
      .get(`${API_BASE}/api/movies`)
      .then((res) => {
        if (isMounted && res.data.length > 0) {
          setMovie(res.data[0]);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMovie(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!movie) return null;

  const poster = movie.poster.startsWith("/uploads")
    ? `${API_BASE}${movie.poster}`
    : movie.poster;

  return (
    <section
      className="hero-banner"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(5, 5, 10, 0.96), rgba(5, 5, 10, 0.2)), url(${poster})`,
      }}
    >
      <div className="hero-copy">
        <span className="hero-label">Featured</span>
        <h1>{movie.title}</h1>
        <p>{movie.description}</p>

        <div className="hero-buttons">
          <Link to={`/watch/${movie._id}`} className="btn-primary">
            ▶ Play
          </Link>
          <Link to={`/movie/${movie._id}`} className="btn-secondary">
            More Info
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Banner;