require("dotenv").config();
const mongoose = require("mongoose");
const Movie = require("../models/Movie");
const {
  getMoviesByCategory,
  getMovieDetails,
  transformTmdbMovie,
} = require("../services/tmdbService");

const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY || TMDB_API_KEY === "your_tmdb_api_key_here") {
  console.error(
    "⚠️  TMDB_API_KEY not set in .env file!"
  );
  console.error("Get your free API key from: https://www.themoviedb.org/settings/api");
  process.exit(1);
}

const CATEGORIES = [
  { tmdb: "upcoming", local: "upcoming", pages: 2 },
  { tmdb: "now_playing", local: "now-playing", pages: 3 },
  { tmdb: "popular", local: "popular", pages: 4 },
  { tmdb: "top_rated", local: "top-rated", pages: 3 },
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✓ Connected to MongoDB");
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const seedMovies = async () => {
  try {
    await connectDB();

    // Clear existing movies (optional - remove if you want to keep existing)
    // await Movie.deleteMany({});
    // console.log("✓ Cleared existing movies");

    let totalMovies = 0;
    let addedMovies = 0;
    let skippedMovies = 0;
    let errorCount = 0;

    for (const category of CATEGORIES) {
      console.log(`\n📽️  Fetching ${category.local} movies...`);

      for (let page = 1; page <= category.pages; page++) {
        try {
          const movies = await getMoviesByCategory(category.tmdb, page);

          if (!movies.length) {
            console.log(`  Page ${page}: No movies found`);
            continue;
          }

          console.log(`  Page ${page}: ${movies.length} movies found`);

          for (const tmdbMovie of movies) {
            totalMovies++;

            // Check if movie already exists
            const existingMovie = await Movie.findOne({ tmdbId: tmdbMovie.id });
            if (existingMovie) {
              skippedMovies++;
              continue;
            }

            try {
              // Get detailed movie information including videos
              const detailedData = await getMovieDetails(tmdbMovie.id);

              const movieData = transformTmdbMovie(tmdbMovie, detailedData);
              movieData.status = category.local;

              // Save to database
              const newMovie = new Movie(movieData);
              await newMovie.save();
              addedMovies++;

              console.log(`    ✓ Added: ${movieData.title} (${movieData.year})`);
            } catch (movieError) {
              errorCount++;
              console.error(`    ✗ Error processing ${tmdbMovie.title}:`, movieError.message);
            }

            // Rate limiting - TMDB allows ~40 requests per 10 seconds
            await new Promise((resolve) => setTimeout(resolve, 250));
          }
        } catch (pageError) {
          console.error(`  ✗ Error fetching page ${page}:`, pageError.message);
          errorCount++;
        }

        // Delay between pages
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Seeding Complete!");
    console.log("=".repeat(50));
    console.log(`Total processed: ${totalMovies}`);
    console.log(`✓ Added: ${addedMovies}`);
    console.log(`⊘ Skipped (duplicates): ${skippedMovies}`);
    console.log(`✗ Errors: ${errorCount}`);
    console.log("=".repeat(50));

    const totalInDB = await Movie.countDocuments();
    console.log(`\n🎬 Total movies in database: ${totalInDB}`);

    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
};

// Run seeding
seedMovies();
