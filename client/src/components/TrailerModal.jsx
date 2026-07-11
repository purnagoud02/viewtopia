import { useEffect } from "react";

function TrailerModal({ isOpen, onClose, trailerUrl }) {
  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLocalMediaUrl = (url) => {
    if (typeof url !== "string" || !url) return false;
    return url.startsWith("/") || url.startsWith("./") || url.startsWith("http://localhost") || /\.(mp4|webm|ogg)$/i.test(url);
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    const embedMatch = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
    if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|v\/|shorts\/))([A-Za-z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1` : "";
  };

  const embedUrl = getEmbedUrl(trailerUrl);
  const localMedia = isLocalMediaUrl(trailerUrl);

  return (
    <div className="trailer-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="trailer-modal" onClick={(event) => event.stopPropagation()}>
        <button className="trailer-close" onClick={onClose} aria-label="Close trailer">
          ×
        </button>

        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Movie Trailer"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="trailer-frame"
          />
        ) : localMedia ? (
          <video controls autoPlay playsInline className="trailer-frame">
            <source src={trailerUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="trailer-empty-state">
            <h3>Trailer unavailable</h3>
            <p>No trailer is available for this title just yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrailerModal;
