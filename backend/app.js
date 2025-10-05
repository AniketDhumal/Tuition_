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
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');
const path = require('path');

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


const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Configure CORS properly
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000'];

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Enable CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ... rest of your server configuration

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/courses', courses);
app.use('/api/v1/enrollments', enrollments);
app.use('/api/v1/resources', resources);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);


app.get('/test-avatar', (req, res) => {
  try {
    const avatarPath = path.join(__dirname, 'public/uploads/default-avatar.png');
    
    // Check if file exists first
    if (!fs.existsSync(avatarPath)) {
      return res.status(404).json({ 
        error: 'File not found',
        path: avatarPath 
      });
    }
    
    res.sendFile(avatarPath);
  } catch (err) {
    console.error('Test avatar error:', err);
    res.status(500).json({ error: 'Server error' });
  }
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