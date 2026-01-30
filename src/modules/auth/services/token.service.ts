import jwt, { JwtPayload } from 'jsonwebtoken';
import env from '../../../config/env';
import { Types } from 'mongoose';
import crypto from 'crypto';
import AppError from '../../../common/utils/ApiError';
import { STATUS_CODE } from '../../../common/constants/constants';

export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateAccessToken = (id: Types.ObjectId): string => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const decodeToken = (token: string): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload | null;
};

export const getTokenExpiryDate = (token: string): Date | null => {
  const decodedToken = decodeToken(token);
  if (!decodedToken || !decodedToken.exp) {
    return null;
  }

  return new Date(decodedToken.exp * 1000);
};
