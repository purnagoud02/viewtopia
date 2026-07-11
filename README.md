# Viewtopia

Viewtopia is a premium OTT-style streaming platform built with React, Vite, Node.js, Express, MongoDB, and Mongoose. It supports authentication, movie browsing, watchlists, subscriptions, profiles, and an admin dashboard.

## Features

- User authentication and role-based access
- Premium movie browsing and watch experience
- Watchlist, favorites, and watch history
- Subscription and payment flows
- Admin dashboard for content and user management
- Responsive premium UI

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose
- Media: local/static poster and video handling
- Auth: JWT with refresh tokens

## Quick Start

1. Install dependencies from the project root:
   - npm install
2. Create environment files:
   - copy client/.env.example to client/.env
   - copy server/.env.example to server/.env
3. Start the app:
   - npm run dev
4. Open the client at http://localhost:5173 and the API at http://localhost:5000

## Production Build

- Frontend build: npm run build
- Backend start: npm run start

## Project Structure

- client/: React frontend
- server/: Express API and MongoDB integration
- docs/: project documentation

## Documentation

- API docs: docs/API_Documentation.md
- Deployment guide: docs/Deployment_Guide.md
- Environment variables: docs/Environment_Variables.md
- Folder structure: docs/Folder_Structure.md
