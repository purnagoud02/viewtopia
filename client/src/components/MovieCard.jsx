import { memo, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

function MovieCard({ movie, position }) {
  if (!movie) return null;

  const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
  const poster = movie.poster?.startsWith("/uploads") ? `${API_BASE}${movie.poster}` : movie.poster;
  const meta = [movie.year, movie.runtime || movie.duration].filter(Boolean).join(" • ");

  const [hover, setHover] = useState(false);
  const videoRef = useRef(null);

  const previewVideo = useMemo(() => {
    if (!Array.isArray(movie.videos)) return null;
    return movie.videos.find((entry) => typeof entry.url === "string" && /\.(mp4|webm|ogg)$/i.test(entry.url));
  }, [movie]);

  return (
    <div className="movie-card-wrapper" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {position ? <div className="rank-badge">#{position}</div> : null}

      <div className="movie-card">
        <div className="poster-shell">
          <img src={poster} alt={movie.title} />
          {hover && previewVideo ? (
            <video
              ref={videoRef}
              src={previewVideo.url}
              autoPlay
              muted
              playsInline
              loop
              className="hover-preview"
            />
          ) : null}
        </div>

        <div className="movie-overlay">
          <div className="overlay-top">
            <span className="badge">{movie.genre || "Featured"}</span>
            {movie.rating ? <span className="rating">{movie.rating}</span> : null}
          </div>

          <Link to={`/movie/${movie._id}`} className="card-title-link">
            <h3 className="card-title">{movie.title}</h3>
          </Link>
          <p className="card-sub">{meta}</p>

          <div className="movie-buttons">
            <Link to={`/watch/${movie._id}`} className="btn-primary play-btn">▶ Play</Link>
            <Link to={`/movie/${movie._id}`} className="btn-secondary">More Info</Link>
          </div>

          {movie.progress ? (
            <div className="progress-shell">
              <div className="progress-bar" style={{ width: `${Math.min(100, Math.round(movie.progress))}%` }} />
              <small className="progress-label">{Math.round(movie.progress)}% watched</small>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default memo(MovieCard);