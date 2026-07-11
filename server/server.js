const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

const connectDB = require("./config/db");
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config();

const seedAdminUser = async () => {
  try {
    const existing = await User.findOne({ email: "admin@viewtopia.com" });
    if (!existing) {
      const hashedPassword = await bcrypt.hash("Admin123!", 12);
      await User.create({
        name: "Admin",
        email: "admin@viewtopia.com",
        password: hashedPassword,
        role: "admin",
        emailVerified: true,
        profileCompleted: true,
      });
      console.log("Seeded default admin user: admin@viewtopia.com / Admin123!");
    }
  } catch (error) {
    console.error("Admin seed failed:", error.message);
  }
};

connectDB().then(() => seedAdminUser());

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(compression());
app.use(morgan("combined"));
app.use(limiter);
app.use(cors({ origin: "*" }));
// Add a raw body parser for the payment webhook path before json parsing
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  // delegate to payment controller - it will parse and validate
  const handler = require('./controllers/paymentController').webhookHandler;
  return handler(req, res, next);
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
// mongoSanitize middleware temporarily disabled due to compatibility issues
// app.use(mongoSanitize());

const csrfProtection = csrf({ cookie: true });
const csrfExemptPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh-token",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/google-login",
  "/api/auth/verify-email",
  "/csrf-token",
];

app.use((req, res, next) => {
  if (req.method === "GET" || csrfExemptPaths.includes(req.path)) {
    return next();
  }
  return csrfProtection(req, res, next);
});

// static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// home
app.get("/", (req, res) => {
  res.send("StreamFlix Backend Running");
});

app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const PORT = process.env.PORT || 5000;

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});