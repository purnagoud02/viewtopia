const axios = require("axios");

const TMDB_API_KEY = process.env.TMDB_API_KEY || "your_key_here";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

/**
 * Fetch movies from TMDB by category
 */
const getMoviesByCategory = async (category = "popular", page = 1) => {
  try {
    const response = await tmdbAxios.get(`/movie/${category}`, {
      params: { page },
    });
    return response.data.results || [];
  } catch (error) {
    console.error(`TMDB API Error (${category}):`, error.message);
    return [];
  }
};

/**
 * Get detailed movie information including credits and videos
 */
const getMovieDetails = async (movieId) => {
  try {
    const [movieData, creditsData, videosData] = await Promise.all([
      tmdbAxios.get(`/movie/${movieId}`),
      tmdbAxios.get(`/movie/${movieId}/credits`),
      tmdbAxios.get(`/movie/${movieId}/videos`),
    ]);

    return {
      movie: movieData.data,
      credits: creditsData.data,
      videos: videosData.data.results || [],
    };
  } catch (error) {
    console.error("TMDB API Error (details):", error.message);
    return null;
  }
};

/**
 * Format poster URL
 */
const getPosterUrl = (posterPath, size = "w500") => {
  if (!posterPath) return "";
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
};

/**
 * Format backdrop URL
 */
const getBackdropUrl = (backdropPath, size = "w1280") => {
  if (!backdropPath) return "";
  return `${TMDB_IMAGE_BASE}/${size}${backdropPath}`;
};

/**
 * Search movies by query
 */
const searchMovies = async (query, page = 1) => {
  try {
    const response = await tmdbAxios.get("/search/movie", {
      params: { query, page },
    });
    return response.data.results || [];
  } catch (error) {
    console.error("TMDB Search Error:", error.message);
    return [];
  }
};

/**
 * Get genres from TMDB
 */
const getGenres = async () => {
  try {
    const response = await tmdbAxios.get("/genre/movie/list");
    return response.data.genres || [];
  } catch (error) {
    console.error("TMDB Genres Error:", error.message);
    return [];
  }
};

/**
 * Transform TMDB movie to our database format
 */
const transformTmdbMovie = (tmdbMovie, detailedData = null) => {
  const videos = detailedData?.videos || [];
  
  // Extract video URLs (YouTube trailers)
  const videoList = videos
    .filter((v) => v.site === "YouTube")
    .map((v) => ({
      url: `https://www.youtube.com/embed/${v.key}`,
      title: v.name,
      category: v.type.toLowerCase().replace(" ", "-"),
      source: "youtube",
    }));

  const credits = detailedData?.credits || {};
  const cast = credits.cast?.slice(0, 5).map((actor) => actor.name) || [];
  const directors = credits.crew
    ?.filter((person) => person.job === "Director")
    .map((person) => person.name) || [];

  return {
    tmdbId: tmdbMovie.id,
    title: tmdbMovie.title,
    description: tmdbMovie.overview,
    genre: tmdbMovie.genres?.map((g) => g.name) || [],
    poster: getPosterUrl(tmdbMovie.poster_path),
    backdrop: getBackdropUrl(tmdbMovie.backdrop_path),
    cast,
    director: directors,
    runtime: tmdbMovie.runtime || 0,
    rating: parseFloat(tmdbMovie.vote_average) || 0,
    voteCount: tmdbMovie.vote_count || 0,
    releaseDate: new Date(tmdbMovie.release_date),
    year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : new Date().getFullYear(),
    language: tmdbMovie.original_language,
    budget: tmdbMovie.budget || 0,
    revenue: tmdbMovie.revenue || 0,
    popularity: tmdbMovie.popularity || 0,
    videos: videoList,
    isPremium: parseFloat(tmdbMovie.vote_average) >= 7.5,
    status: determinePremiumStatus(tmdbMovie.release_date),
  };
};

/**
 * Determine movie status based on release date
 */
const determinePremiumStatus = (releaseDate) => {
  if (!releaseDate) return "now-playing";
  
  const release = new Date(releaseDate);
  const now = new Date();
  const daysUntilRelease = Math.floor((release - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilRelease > 30) return "upcoming";
  if (daysUntilRelease > 0) return "upcoming";
  if (daysUntilRelease > -60) return "now-playing";
  return "popular";
};

module.exports = {
  getMoviesByCategory,
  getMovieDetails,
  getPosterUrl,
  getBackdropUrl,
  searchMovies,
  getGenres,
  transformTmdbMovie,
};
