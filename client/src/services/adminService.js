import api from "./api";

// Admin endpoints
export const adminService = {
  // Get dashboard stats
  getDashboardStats: () => api.get("/admin/dashboard"),
  
  // Get all users
  getAllUsers: () => api.get("/admin/users"),
  
  // Get user by ID
  getUserById: (id) => api.get(`/admin/users/${id}`),
  
  // Update user
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  
  // Delete user
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Get all movies
  getAllMovies: () => api.get("/admin/movies"),
  
  // Get movie by ID
  getMovieById: (id) => api.get(`/admin/movies/${id}`),
  
  // Create movie
  createMovie: (movieData) => api.post("/admin/movies", movieData),
  
  // Update movie
  updateMovie: (id, movieData) => api.put(`/admin/movies/${id}`, movieData),
  
  // Delete movie
  deleteMovie: (id) => api.delete(`/admin/movies/${id}`),
};

export default adminService;
