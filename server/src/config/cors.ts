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
  origin: allowedOrigins,
  credentials: true,
};
