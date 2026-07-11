# Deployment Guide

## Local Development

1. Install dependencies from the repository root.
2. Create environment files from the examples.
3. Start the frontend and backend with npm run dev.

## Production Deployment

### Frontend

Deploy the React app to Vercel, Netlify, or a static hosting provider.

Required environment variable:
- VITE_API_URL=https://your-backend-url

### Backend

Deploy the Express server to Render, Railway, Fly.io, or a similar Node.js host.

Required environment variables:
- PORT
- MONGO_URI
- JWT_SECRET
- JWT_REFRESH_SECRET
- CLIENT_URL
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET

### Database

Use MongoDB Atlas or another managed MongoDB instance.

### Files to upload

- server/ source code
- client/ production build output if using a static host
- public assets and uploads directory if needed
