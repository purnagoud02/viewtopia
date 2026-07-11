import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function EditMovie() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState({
    title: "",
    genre: "",
    poster: "",
    backdrop: "",
    cast: "",
    director: "",
    runtime: "",
    rating: "",
    releaseDate: "",
    year: "",
    trailer: "",
    videoUrl: "",
    description: "",
  });

  const fetchMovie = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/movies/${id}`);
      setMovie(data);
    } catch {
      setMovie({
        title: "",
        genre: "",
        poster: "",
        backdrop: "",
        cast: "",
        director: "",
        runtime: "",
        rating: "",
        releaseDate: "",
        year: "",
        trailer: "",
        videoUrl: "",
        description: "",
      });
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const loadMovie = async () => {
      await fetchMovie();
      if (!isMounted) {
        return;
      }
    };

    loadMovie();

    return () => {
      isMounted = false;
    };
  }, [fetchMovie]);

  const changeHandler = (e) => {
    setMovie({
      ...movie,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/api/movies/${id}`, {
        ...movie,
        year: Number(movie.year),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Movie Updated Successfully!");

      navigate("/admin/movies");
    } catch {
      alert("Update Failed");
    }
  };

  return (
    <div className="container">
      <h1>Edit Movie</h1>

      <form onSubmit={submitHandler}>
        <input
          name="title"
          value={movie.title}
          onChange={changeHandler}
          placeholder="Title"
        />

        <input
          name="genre"
          value={movie.genre}
          onChange={changeHandler}
          placeholder="Genre"
        />

        <input
          name="cast"
          value={movie.cast}
          onChange={changeHandler}
          placeholder="Cast"
        />

        <input
          name="director"
          value={movie.director}
          onChange={changeHandler}
          placeholder="Director"
        />

        <input
          name="runtime"
          value={movie.runtime}
          onChange={changeHandler}
          placeholder="Runtime"
        />

        <input
          name="rating"
          value={movie.rating}
          onChange={changeHandler}
          placeholder="Rating"
        />

        <input
          name="releaseDate"
          value={movie.releaseDate}
          onChange={changeHandler}
          placeholder="Release Date"
        />

        <input
          name="year"
          value={movie.year}
          onChange={changeHandler}
          placeholder="Year"
        />

        <input
          name="poster"
          value={movie.poster}
          onChange={changeHandler}
          placeholder="Poster URL"
        />

        <input
          name="backdrop"
          value={movie.backdrop}
          onChange={changeHandler}
          placeholder="Backdrop URL"
        />

        <input
          name="trailer"
          value={movie.trailer}
          onChange={changeHandler}
          placeholder="Trailer URL"
        />

        <input
          name="videoUrl"
          value={movie.videoUrl}
          onChange={changeHandler}
          placeholder="Video URL"
        />

        <textarea
          rows="5"
          name="description"
          value={movie.description}
          onChange={changeHandler}
          placeholder="Description"
        />

        <br />
        <br />

        <button type="submit">
          Update Movie
        </button>
      </form>
    </div>
  );
}

export default EditMovie;