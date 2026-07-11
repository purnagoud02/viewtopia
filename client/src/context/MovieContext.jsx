import { createContext, useState, useEffect, useCallback } from "react";
import movieService from "../services/movieService";

const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await movieService.getAllMovies();
      setMovies(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch movies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch movie by ID
  const getMovieById = async (id) => {
    try {
      const response = await movieService.getMovieById(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch movie");
      throw err;
    }
  };

  // Search movies
  const searchMovies = async (query) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await movieService.searchMovies(query);
      setMovies(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get movies by genre
  const getByGenre = async (genre) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await movieService.getByGenre(genre);
      setMovies(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch movies by genre");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <MovieContext.Provider
      value={{
        movies,
        isLoading,
        error,
        fetchMovies,
        getMovieById,
        searchMovies,
        getByGenre,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export default MovieContext;
