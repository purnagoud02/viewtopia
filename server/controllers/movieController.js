const jwt = require("jsonwebtoken");
const Movie = require("../models/Movie");
const User = require("../models/User");

const getRequestUser = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select("-password -refreshToken");
  } catch {
    return null;
  }
};

const normalizeMovie = (movie) => ({
  ...movie.toObject(),
  poster: movie.poster || "",
  backdrop: movie.backdrop || "",
  description: movie.description || "",
  genre: movie.genre || "",
  cast: movie.cast || "",
  director: movie.director || "",
  runtime: movie.runtime || "",
  rating: movie.rating || "",
  releaseDate: movie.releaseDate || "",
  trailer: movie.trailer || "",
  videoUrl: movie.videoUrl || "",
  year: movie.year || new Date().getFullYear(),
  isPremium: Boolean(movie.isPremium),
});

// Add Movie
const addMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Movies
const getMovies = async (req, res) => {
  try {
    const user = await getRequestUser(req);
    const movies = await Movie.find();
    const visibleMovies = movies.filter((movie) => !movie.isPremium || (user && user.isPremium));
    res.json(visibleMovies.map(normalizeMovie));
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Movie
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    const user = await getRequestUser(req);
    if (movie.isPremium && (!user || !user.isPremium)) {
      return res.status(403).json({ message: "Premium subscription required to access this title" });
    }

    res.json(normalizeMovie(movie));
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Movie
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.json(normalizeMovie(movie));
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Movie
const deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);

    res.json({
      message: "Movie Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
};