module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your-strong-secret-key-here', // Always use environment variable in production
    jwtExpire: process.env.JWT_EXPIRE || '24h', // Token expiration (e.g., 24 hours)
    jwtCookieExpire: process.env.JWT_COOKIE_EXPIRE || 30 // Cookie expiration in days
  };