import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function AddMovie() {
  const [movie, setMovie] = useState({
    title: "",
    description: "",
    genre: "",
    poster: "",
    backdrop: "",
    cast: "",
    director: "",
    runtime: "",
    rating: "",
    releaseDate: "",
    trailer: "",
    year: "",
    videoUrl: "",
  });

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

      await axios.post(`${API_BASE}/api/movies`, {
        title: movie.title,
        description: movie.description,
        genre: movie.genre,
        poster: movie.poster,
        backdrop: movie.backdrop,
        cast: movie.cast,
        director: movie.director,
        runtime: movie.runtime,
        rating: movie.rating,
        releaseDate: movie.releaseDate,
        trailer: movie.trailer,
        year: Number(movie.year),
        videoUrl: movie.videoUrl,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("🎉 Movie Added Successfully!");

      setMovie({
        title: "",
        description: "",
        genre: "",
        poster: "",
        backdrop: "",
        cast: "",
        director: "",
        runtime: "",
        rating: "",
        releaseDate: "",
        trailer: "",
        year: "",
        videoUrl: "",
      });

    } catch {
      alert("Failed to add movie");
    }
  };

  return (
    <div style={{ background: "#141414", color: "white", padding: "20px" }}>
      <h1>🎬 Add Movie</h1>

      <form onSubmit={submitHandler}>
        <input name="title" placeholder="Title" value={movie.title} onChange={changeHandler} />
        <br /><br />

        <input name="genre" placeholder="Genre" value={movie.genre} onChange={changeHandler} />
        <br /><br />

        <input name="cast" placeholder="Cast" value={movie.cast} onChange={changeHandler} />
        <br /><br />

        <input name="director" placeholder="Director" value={movie.director} onChange={changeHandler} />
        <br /><br />

        <input name="runtime" placeholder="Runtime" value={movie.runtime} onChange={changeHandler} />
        <br /><br />

        <input name="rating" placeholder="Rating" value={movie.rating} onChange={changeHandler} />
        <br /><br />

        <input name="releaseDate" placeholder="Release Date" value={movie.releaseDate} onChange={changeHandler} />
        <br /><br />

        <input name="year" placeholder="Year" value={movie.year} onChange={changeHandler} />
        <br /><br />

        <input name="poster" placeholder="Poster URL" value={movie.poster} onChange={changeHandler} />
        <br /><br />

        <input name="backdrop" placeholder="Backdrop URL" value={movie.backdrop} onChange={changeHandler} />
        <br /><br />

        <input name="videoUrl" placeholder="Video URL" value={movie.videoUrl} onChange={changeHandler} />
        <br /><br />

        <input name="trailer" placeholder="Trailer URL" value={movie.trailer} onChange={changeHandler} />
        <br /><br />

        <textarea name="description" placeholder="Description" value={movie.description} onChange={changeHandler} />
        <br /><br />

        <button type="submit">➕ Add Movie</button>
      </form>
    </div>
  );
}

export default AddMovie;