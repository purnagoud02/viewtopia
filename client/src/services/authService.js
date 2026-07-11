import api from "./api";

// Auth endpoints
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getProfile: () => api.get("/auth/profile"),
};

export default authService;
