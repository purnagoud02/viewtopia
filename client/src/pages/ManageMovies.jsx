import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function ManageMovies() {
  const [movies, setMovies] = useState([]);

  const fetchMovies = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/movies`);
      setMovies(data);
    } catch {
      setMovies([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      await fetchMovies();
      if (!isMounted) {
        return;
      }
    };

    loadMovies();

    return () => {
      isMounted = false;
    };
  }, [fetchMovies]);

  const deleteMovie = async (id) => {
    if (!window.confirm("Delete this movie?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/movies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Movie Deleted");

      fetchMovies();
    } catch {
      alert("Delete Failed");
    }
  };

  return (
    <div className="container">
      <h1>🎬 Manage Movies</h1>

      <table
        style={{
          width: "100%",
          color: "white",
          marginTop: "20px",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>Poster</th>
            <th>Title</th>
            <th>Genre</th>
            <th>Year</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {movies.map((movie) => (
            <tr key={movie._id}>
              <td>
                <img
                  src={movie.poster}
                  alt={movie.title}
                  width="70"
                />
              </td>

              <td>{movie.title}</td>

              <td>{movie.genre}</td>

              <td>{movie.year}</td>

              <td>
                <Link to={`/admin/edit/${movie._id}`}>
                  <button>Edit</button>
                </Link>

                <button
                  onClick={() => deleteMovie(movie._id)}
                  style={{
                    marginLeft: "10px",
                    background: "red",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageMovies;