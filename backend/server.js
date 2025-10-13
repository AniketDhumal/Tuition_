const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const compression = require('compression');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');
const { swaggerDocs } = require('./utils/swagger');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const courses = require('./routes/courseRoutes');
const enrollments = require('./routes/enrollmentRoutes');
const resources = require('./routes/resourceRoutes');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const resultRoutes = require('./routes/resultRoutes');


const app = express();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const resourceUploadDir = path.join(__dirname, 'public/uploads/resources');
if (!fs.existsSync(resourceUploadDir)) {
  fs.mkdirSync(resourceUploadDir, { recursive: true });
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000',`http://localhost:5173`];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || origin.startsWith(allowedOrigin);
    })) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
};

// Enable CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parser with increased limit for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sanitize data against NoSQL injection
app.use(mongoSanitize({
  replaceWith: '_'
}));

// Set security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'cdn.jsdelivr.net'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Prevent XSS attacks
app.use(xss());

// Rate limiting - more granular configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many login attempts from this IP, please try again after an hour'
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/', apiLimiter);

// Prevent http param pollution
app.use(hpp());

// Response compression
app.use(compression());

// Request logging middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  });
});

// Mount routers with versioning
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/courses', courses);
app.use('/api/v1/enrollments', enrollments);
app.use('/api/v1/resources', resources);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/results', resultRoutes);

// Test endpoint for file serving
app.get('/test-avatar', (req, res) => {
  try {
    const avatarPath = path.join(__dirname, 'public/uploads/default-avatar.png');
    
    if (!fs.existsSync(avatarPath)) {
      return res.status(404).json({ 
        success: false,
        error: 'File not found',
        path: avatarPath 
      });
    }
    
    res.sendFile(avatarPath);
  } catch (err) {
    console.error('Test avatar error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

// Swagger documentation setup
if (process.env.NODE_ENV !== 'production') {
  swaggerDocs(app, parseInt(process.env.PORT || 5000));
}

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});