import rateLimit from 'express-rate-limit';

// General API rate limiter function
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth rate limiter function
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Create limiter function
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Create limit reached. Please try again later.'
  }
});


