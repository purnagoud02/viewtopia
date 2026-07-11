import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (!user?._id) {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/api/watchlist/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMovies(data || []);
      } catch {
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  // loading state
  if (loading) {
    return (
      <div style={{ padding: "20px", color: "white" }}>
        <h2>Loading watchlist...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>❤️ My Watchlist</h1>

      {movies.length === 0 ? (
        <p style={{ opacity: 0.7 }}>
          No movies in your watchlist.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {movies.map((item) => (
            <div
              key={item._id}
              style={{
                width: "220px",
                background: "#1f1f1f",
                padding: "15px",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <img
                src={item.movie?.poster}
                alt={item.movie?.title}
                width="180"
                style={{ borderRadius: "10px" }}
                onError={(e) => {
                  e.target.src =
                    "https://dummyimage.com/300x450/333/fff&text=No+Image";
                }}
              />

              <h3>{item.movie?.title}</h3>

              <p>
                <strong>Genre:</strong> {item.movie?.genre}
              </p>

              <p>
                <strong>Year:</strong> {item.movie?.year}
              </p>

              <p>{item.movie?.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Watchlist;