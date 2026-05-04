import { CorsOptions } from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
];

// Add production origin from env if set
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In production, allow same-origin requests
    callback(null, true);
  },
  credentials: true,
};
