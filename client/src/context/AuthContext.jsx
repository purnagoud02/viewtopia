import { createContext, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [isLoading] = useState(false);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { accessToken, token: legacyToken, user: userData } = response.data;

    const newToken = accessToken || legacyToken;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));

    return response.data;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    const { accessToken, token: legacyToken, user: newUser } = response.data;

    const newToken = accessToken || legacyToken;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
