import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import TrailerModal from "../components/TrailerModal";
import movieCatalog from "../data/movieCatalog";
import "./MovieDetails.css";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_BASE}/api/movies/${id}`, { headers });
        setMovie(res.data);
        if (res.data.videos && res.data.videos.length > 0) {
          const mainTrailer = res.data.videos.find((v) => v.category === "trailer") || res.data.videos[0];
          setSelectedVideo(mainTrailer);
        }
      } catch {
        const fallback = movieCatalog.find((item) => item._id === id) || movieCatalog[0];
        setMovie(fallback);
        if (fallback?.videos?.length) {
          setSelectedVideo(fallback.videos[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return <div className="page detail-loading">Loading movie details...</div>;
  }

  if (!movie) {
    return <div className="page detail-empty">This title is currently unavailable.</div>;
  }

  const resolveMediaUrl = (url) => {
    if (typeof url !== "string" || !url) return "";
    if (url.startsWith("/uploads")) {
      return `${API_BASE}${url}`;
    }
    return url;
  };

  const poster = resolveMediaUrl(movie.poster) || movie.poster;
  const backdrop = movie.backdrop ? resolveMediaUrl(movie.backdrop) : poster;

  const isLocalMediaUrl = (url) => {
    const resolved = resolveMediaUrl(url);
    return typeof resolved === "string" && resolved !== "" && /\.(mp4|webm|ogg)$/i.test(resolved);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    const resolved = resolveMediaUrl(url);
    const embedMatch = resolved.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
    if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
    const match = resolved.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|v\/|shorts\/))([A-Za-z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1` : "";
  };

  const renderTrailerPlayer = (videoUrl, title) => {
    const resolvedUrl = resolveMediaUrl(videoUrl);
    if (!resolvedUrl) return null;

    const embedUrl = getYouTubeEmbedUrl(resolvedUrl);
    if (embedUrl) {
      return (
        <iframe
          width="100%"
          height="600"
          src={embedUrl}
          title={title || "Video"}
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (isLocalMediaUrl(resolvedUrl)) {
      return (
        <video controls autoPlay playsInline className="trailer-frame" poster={poster || undefined}>
          <source src={resolvedUrl} type={resolvedUrl.endsWith(".mp4") ? "video/mp4" : "video/webm"} />
          Your browser does not support the video tag.
        </video>
      );
    }

    return <p className="detail-empty">Trailer preview will be available soon.</p>;
  };

  const highlightArray = [];
  if (Array.isArray(movie.genre)) {
    highlightArray.push(movie.genre.join(", "));
  } else if (movie.genre) {
    highlightArray.push(movie.genre);
  }
  if (movie.year) highlightArray.push(movie.year);
  if (movie.runtime) highlightArray.push(`${movie.runtime} min`);

  const formatCast = () => {
    if (Array.isArray(movie.cast)) return movie.cast.join(", ") || "Coming soon";
    if (typeof movie.cast === "string") return movie.cast || "Coming soon";
    return "Coming soon";
  };

  const formatDirector = () => {
    if (Array.isArray(movie.director)) return movie.director.join(", ") || "TBA";
    if (typeof movie.director === "string") return movie.director || "TBA";
    return "TBA";
  };

  const getCategoryLabel = (category) => {
    const labels = {
      trailer: "🎬 Trailer",
      teaser: "🎭 Teaser",
      "behind-the-scenes": "🎞️ Behind-the-Scenes",
      featurette: "🎪 Featurette",
      interview: "🎤 Interview",
      clip: "🎥 Clip",
    };
    return labels[category] || category;
  };

  return (
    <div className="page movie-detail-page">
      <section className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,5,10,0.95), rgba(5,5,10,0.35)), url(${backdrop || poster})` }}>
        <div className="detail-hero__content">
          <p className="eyebrow">Now Streaming</p>
          <h1>{movie.title}</h1>
          {movie.rating && (
            <div className="detail-rating">
              <span className="rating-value">⭐ {Number(movie.rating).toFixed(1)}/10</span>
              {movie.voteCount && <span className="vote-count">({movie.voteCount.toLocaleString()} votes)</span>}
            </div>
          )}
          <p className="detail-meta">{highlightArray.join(" • ")}</p>
          <p className="detail-description">{movie.description || "A premium cinematic experience from the Viewtopia library."}</p>

          <div className="detail-actions">
            <Link to={`/watch/${movie._id}`} className="btn-primary">▶ Watch Now</Link>
            {movie.videos && movie.videos.length > 0 && (
              <button className="btn-secondary" onClick={() => setShowTrailer(true)}>▶ Watch Trailer</button>
            )}
            <Link to="/home" className="btn-secondary">Browse Library</Link>
          </div>
        </div>
        <img src={poster} alt={movie.title} className="detail-hero__poster" />
      </section>

      <section className="detail-videos glass">
        <h2>Media & Clips</h2>
        {selectedVideo ? (
          <div className="video-player-container">
            <div className="main-video">
              {renderTrailerPlayer(selectedVideo.url, selectedVideo.title)}
              <div className="video-title-group">
                <p className="video-title">{selectedVideo.title || "Video"}</p>
                {selectedVideo.category ? (
                  <small className="video-category">{getCategoryLabel(selectedVideo.category)}</small>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <p className="detail-empty">Trailer preview will be available soon.</p>
        )}

        {movie.videos && movie.videos.length > 1 && (
          <div className="video-carousel">
            {movie.videos.map((video, idx) => (
              <button
                key={idx}
                className={`video-thumb ${selectedVideo === video ? 'active' : ''}`}
                onClick={() => setSelectedVideo(video)}
              >
                <div className="video-thumb__title">{video.title || `Clip ${idx + 1}`}</div>
                <div className="video-thumb__type">{video.category || 'Clip'}</div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="detail-panel glass">
        <div className="detail-panel__card">
          <h2>About this title</h2>
          <p>{movie.description || "A curated pick from our premium movie collection."}</p>
        </div>

        <div className="detail-panel__card">
          <h2>Movie Details</h2>
          <ul>
            <li><strong>Cast:</strong> {formatCast()}</li>
            <li><strong>Director:</strong> {formatDirector()}</li>
            <li><strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : "TBA"}</li>
            <li><strong>Rating:</strong> {movie.rating ? `${Number(movie.rating).toFixed(1)}/10` : "NR"}</li>
            <li><strong>Release Date:</strong> {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : movie.year || "TBA"}</li>
            <li><strong>Language:</strong> {movie.language || "English"}</li>
          </ul>
        </div>
      </section>

      <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} trailerUrl={selectedVideo?.url} />
    </div>
  );
}

export default MovieDetails;