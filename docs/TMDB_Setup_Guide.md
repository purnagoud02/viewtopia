# Movie Database & TMDB Integration Guide

## Step 1: Get TMDB API Key

1. Go to [TMDB Registration](https://www.themoviedb.org/settings/api)
2. Create a free account or log in
3. Click "Create" under "Request an API Key"
4. Select "Developer" and agree to terms
5. You'll receive your API key immediately

## Step 2: Add API Key to Environment

1. Open `/server/.env`
2. Replace the placeholder with your actual key:
   ```
   TMDB_API_KEY=your_actual_api_key_here
   ```

## Step 3: Seed the Database

Run the seed script to populate movies with real posters and trailers:

```bash
cd server
npm run seed
```

This will:
- Fetch movies from TMDB across multiple categories:
  - Upcoming movies
  - Now playing movies
  - Popular movies
  - Top-rated movies
- Download poster and backdrop images
- Extract trailer videos (YouTube links)
- Extract cast and crew information
- Store everything in MongoDB

**Note**: First run may take 5-10 minutes due to API rate limiting. Progress will be shown in terminal.

## Step 4: Verify Installation

1. Start the server: `npm start`
2. Navigate to home page: `http://localhost:5173/home`
3. You should see 50+ real movies with professional posters

## Categories Seeded

- **Upcoming**: Movies releasing soon
- **Now Playing**: Currently in theaters  
- **Popular**: Most popular movies
- **Top Rated**: Highest-rated movies by critics

## Available Video Types

For each movie, multiple video types are extracted:
- 🎬 **Trailers**: Official movie trailers
- 🎭 **Teasers**: Movie teasers
- 🎞️ **Behind-the-Scenes**: Production footage
- 🎪 **Featurettes**: Extended features
- 🎤 **Interviews**: Cast/crew interviews
- 🎥 **Clips**: Movie clips

## API Rate Limits

TMDB allows:
- 40 requests per 10 seconds
- Seeding includes built-in delays to respect rate limits
- If you hit rate limits, wait 10 seconds and re-run the seed script

## Troubleshooting

**Error: "TMDB_API_KEY not set"**
- Make sure `.env` file has `TMDB_API_KEY` set
- Restart server after updating `.env`

**Error: "API not responding"**
- Check internet connection
- Verify API key is correct
- Check if TMDB service is up: https://www.themoviedb.org

**Movies not appearing in app**
- Verify seed script completed successfully
- Check MongoDB connection
- Restart the application

## Running Seed Script Again

To add more movies or refresh data:
```bash
npm run seed
```

The script automatically skips duplicate movies (same tmdbId), so it's safe to run multiple times.

## Next Steps

After seeding:
1. Browse movies on home page
2. Click on any movie to see trailers
3. Test premium subscription features
4. Verify trailer playback
