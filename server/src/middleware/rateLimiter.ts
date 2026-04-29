import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, error: 'Too many requests, try again later' },
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100,
  message: { success: false, error: 'Too many requests, try again later' },
});
