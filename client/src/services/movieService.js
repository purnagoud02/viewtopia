import api from "./api";

// Movie endpoints
export const movieService = {
  // Get all movies
  getAllMovies: () => api.get("/movies"),
  
  // Get movie by ID
  getMovieById: (id) => api.get(`/movies/${id}`),
  
  // Search movies
  searchMovies: (query) => api.get("/movies/search", { params: { q: query } }),
  
  // Get movies by genre
  getByGenre: (genre) => api.get("/movies/genre", { params: { genre } }),
  
  // Create movie (admin)
  createMovie: (movieData) => api.post("/movies", movieData),
  
  // Update movie (admin)
  updateMovie: (id, movieData) => api.put(`/movies/${id}`, movieData),
  
  // Delete movie (admin)
  deleteMovie: (id) => api.delete(`/movies/${id}`),
  
  // Get featured movies
  getFeatured: () => api.get("/movies/featured"),
  
  // Rate movie
  rateMovie: (movieId, rating) => api.post(`/movies/${movieId}/rate`, { rating }),
};

export default movieService;
