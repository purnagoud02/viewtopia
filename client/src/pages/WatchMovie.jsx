import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const STORAGE_KEY = "viewtopia-watch-progress";
const RECENT_KEY = "viewtopia-recently-watched";

function WatchMovie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_BASE}/api/movies/${id}`, { headers });
        setMovie(res.data);
        const savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        const resumeTime = savedProgress[id] ?? 0;
        setCurrentTime(resumeTime);
        setResumeAvailable(resumeTime > 0);
      } catch {
        setError("Unable to load this movie right now.");
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const recentHistory = useMemo(() => {
    if (!movie) return [];
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  }, [movie]);

  useEffect(() => {
    const handler = window.setTimeout(() => setRecentlyWatched(recentHistory), 0);
    return () => window.clearTimeout(handler);
  }, [recentHistory]);

  useEffect(() => {
    if (!movie || !videoRef.current) return;

    const video = videoRef.current;
    video.volume = volume;
    video.playbackRate = playbackRate;

    if (video.textTracks && video.textTracks[0]) {
      video.textTracks[0].mode = showSubtitles ? "showing" : "hidden";
    }
  }, [movie, volume, playbackRate, showSubtitles]);

  useEffect(() => {
    if (!movie) return;

    const saveProgress = () => {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const nextTime = Math.floor(videoRef.current?.currentTime || 0);
      saved[id] = nextTime;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setResumeAvailable(nextTime > 0);

      const history = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      const nextEntry = { id: movie._id, title: movie.title, poster: movie.poster, genre: movie.genre };
      const filtered = history.filter((entry) => entry.id !== nextEntry.id);
      filtered.unshift(nextEntry);
      localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 6)));
      setRecentlyWatched(filtered.slice(0, 6));
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoRef.current?.currentTime || 0);
    };

    const handleLoadedMetadata = () => {
      const video = videoRef.current;
      if (!video) return;
      setDuration(video.duration || 0);
      const savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const resumeTime = savedProgress[id] || 0;
      if (resumeTime > 0) {
        video.currentTime = resumeTime;
        setCurrentTime(resumeTime);
      }
    };

    const video = videoRef.current;
    video?.addEventListener("timeupdate", handleTimeUpdate);
    video?.addEventListener("loadedmetadata", handleLoadedMetadata);
    video?.addEventListener("ended", saveProgress);
    video?.addEventListener("pause", saveProgress);
    video?.addEventListener("play", () => setIsPlaying(true));
    video?.addEventListener("pause", () => setIsPlaying(false));

    return () => {
      video?.removeEventListener("timeupdate", handleTimeUpdate);
      video?.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video?.removeEventListener("ended", saveProgress);
      video?.removeEventListener("pause", saveProgress);
      video?.removeEventListener("play", () => setIsPlaying(true));
      video?.removeEventListener("pause", () => setIsPlaying(false));
    };
  }, [movie, id]);

  const progressPercent = useMemo(() => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  const formatTime = (value) => {
    if (!Number.isFinite(value) || value < 0) return "0:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const togglePlay = async () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      await videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekTo = (event) => {
    if (!videoRef.current || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const nextTime = ratio * duration;
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await videoRef.current.requestFullscreen();
    }
  };

  const togglePip = async () => {
    if (!videoRef.current) return;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (videoRef.current !== document.pictureInPictureElement) {
      await videoRef.current.requestPictureInPicture();
    }
  };

  const jumpBy = (seconds) => {
    if (!videoRef.current) return;
    const nextTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  if (loading) return <div className="page detail-loading">Loading player…</div>;
  if (error) return <div className="page detail-empty">{error}</div>;
  if (!movie) return null;

  return (
    <div className="page movie-player-page">
      <div className="player-shell glass">
        <div className="player-header">
          <div>
            <p className="eyebrow">Now Watching</p>
            <h1>{movie.title}</h1>
          </div>
          <div className="player-badge">{resumeAvailable ? "Resume Playback" : "Continue Watching"}</div>
        </div>

        <div className="player-frame">
          <video
            ref={videoRef}
            className="player-video"
            controls={false}
            autoPlay
            preload="metadata"
            playsInline
            poster={movie.poster || movie.backdrop || null}
            src={movie.videoUrl || null}
            onLoadedMetadata={() => {
              const video = videoRef.current;
              if (!video) return;
              setDuration(video.duration || 0);
            }}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <track kind="captions" srcLang="en" label="English" default />
          </video>

          <div className="player-overlay">
            <div className="player-progress" onClick={seekTo}>
              <div className="player-progress__bar" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="player-controls">
              <button className="player-control" onClick={togglePlay}>
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button className="player-control" onClick={() => jumpBy(-10)}>
                -10s
              </button>
              <button className="player-control" onClick={() => jumpBy(10)}>
                +10s
              </button>
              <label className="player-control player-control--select">
                <span>Speed</span>
                <select value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))}>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </label>
              <label className="player-control player-control--select">
                <span>Vol</span>
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
              </label>
              <button className="player-control" onClick={() => setShowSubtitles((value) => !value)}>
                {showSubtitles ? "CC On" : "CC Off"}
              </button>
              <button className="player-control" onClick={togglePip}>PiP</button>
              <button className="player-control" onClick={toggleFullscreen}>Full</button>
            </div>

            <div className="player-timeline">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="recently-watched-panel glass">
        <h2>Recently Watched</h2>
        <div className="recently-watched-list">
          {recentlyWatched.map((item) => (
            <a key={item.id} href={`/watch/${item.id}`} className="recently-watched-item">
              <span>{item.title}</span>
              <small>{item.genre || "Movie"}</small>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WatchMovie;