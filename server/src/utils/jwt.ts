import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface AccessPayload {
  userId: string;
  tier: string;
}

export const signAccessToken = (payload: AccessPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY });
};

export const signRefreshToken = (payload: AccessPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY });
};

export const verifyAccessToken = (token: string): AccessPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AccessPayload;
};

export const verifyRefreshToken = (token: string): AccessPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as AccessPayload;
};
