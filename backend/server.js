// ─────────────────────────────────────────────
//  DEPENDENCIES
// ─────────────────────────────────────────────
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const compression = require("compression");
const errorHandler = require("./middleware/errorHandler");
const connectDB = require("./config/db");
const { swaggerDocs } = require("./utils/swagger");

// ─────────────────────────────────────────────
//  ENVIRONMENT CONFIG
// ─────────────────────────────────────────────
dotenv.config({ path: "./config/config.env" });
connectDB();

// ─────────────────────────────────────────────
//  ROUTES IMPORTS
// ─────────────────────────────────────────────
const auth = require("./routes/authRoutes");
const users = require("./routes/userRoutes");
const courses = require("./routes/courseRoutes");
const enrollments = require("./routes/enrollmentRoutes");
const resources = require("./routes/resourceRoutes");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const resultRoutes = require("./routes/resultRoutes");

// ─────────────────────────────────────────────
//  APP INIT
// ─────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────
//  STATIC & UPLOADS SETUP
// ─────────────────────────────────────────────
const uploadDir = path.join(__dirname, "public/uploads");
const resourceUploadDir = path.join(__dirname, "public/uploads/resources");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(resourceUploadDir)) fs.mkdirSync(resourceUploadDir, { recursive: true });

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir));

// ─────────────────────────────────────────────
//  CORS CONFIGURATION
// ─────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "https://tuition-1-jduh.onrender.com", // your frontend (Render)
      "https://tuition-a32s.onrender.com",   // your backend (Render)
      "http://localhost:3000",               // local React
      "http://127.0.0.1:3000",
      "http://localhost:5173",               // Vite dev
    ];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.some(
        (allowedOrigin) =>
          origin === allowedOrigin || origin.startsWith(allowedOrigin)
      )
    ) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Authorization"],
  optionsSuccessStatus: 200,
};

// Enable CORS globally
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight handler

// ─────────────────────────────────────────────
//  CORE MIDDLEWARE
// ─────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Sanitize against NoSQL injection
app.use(mongoSanitize({ replaceWith: "_" }));

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "cdn.jsdelivr.net",
          "fonts.googleapis.com",
        ],
        imgSrc: ["'self'", "data:", "blob:", "cdn.jsdelivr.net"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// XSS protection
app.use(xss());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message:
    "Too many requests from this IP, please try again after 15 minutes.",
});
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message:
    "Too many login/register attempts from this IP, please try again after an hour.",
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/", apiLimiter);

// Prevent HTTP param pollution
app.use(hpp());

// Response compression
app.use(compression());

// Log requests (for dev)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
});

// ─────────────────────────────────────────────
//  HEALTH CHECK
// ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  });
});

// ─────────────────────────────────────────────
//  ROUTE MOUNTING
// ─────────────────────────────────────────────
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/courses", courses);
app.use("/api/v1/enrollments", enrollments);
app.use("/api/v1/resources", resources);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/results", resultRoutes);

// ─────────────────────────────────────────────
//  TEST ENDPOINT
// ─────────────────────────────────────────────
app.get("/test-avatar", (req, res) => {
  try {
    const avatarPath = path.join(
      __dirname,
      "public/uploads/default-avatar.png"
    );
    if (!fs.existsSync(avatarPath)) {
      return res.status(404).json({
        success: false,
        error: "File not found",
        path: avatarPath,
      });
    }
    res.sendFile(avatarPath);
  } catch (err) {
    console.error("Test avatar error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ─────────────────────────────────────────────
//  SWAGGER DOCS (DEV ONLY)
// ─────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  swaggerDocs(app, parseInt(process.env.PORT || 5000));
}

// ─────────────────────────────────────────────
//  404 HANDLER
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// ─────────────────────────────────────────────
//  ERROR HANDLER
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
//  SERVER START
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  );
});

// ─────────────────────────────────────────────
//  SHUTDOWN HANDLERS
// ─────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
