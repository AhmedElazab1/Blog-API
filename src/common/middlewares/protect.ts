import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../../config/env';
import { IRequest } from '../Interfaces/types';
import { IUser } from '../../models/types/types';
import AppError from '../utils/ApiError';
import { STATUS_CODE } from '../../common/constants/constants';
import { isTokenBlacklisted } from '../../modules/auth/services/blacklist.service';
import { verifyAccessToken } from '../../modules/auth/services/token.service';
import { ITokenPayload } from '../Interfaces/types';
import User from '../../models/User';

const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

const authenticate = async (req: IRequest, res: Response, next: NextFunction) => {
  // Extract token from request headers
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return next(new AppError('Unauthorized', STATUS_CODE.UNAUTHORIZED));
  }

  // Check if token is blacklisted
  const isBlacklisted = await isTokenBlacklisted(token);
  if (isBlacklisted) {
    return next(new AppError('Token is blacklisted', STATUS_CODE.UNAUTHORIZED));
  }

  // Verify access token
  const decodedToken: ITokenPayload = await verifyAccessToken(token);

  // Find user by id
  const user = await User.findById(decodedToken.id);

  if (!user) {
    return next(new AppError('User not found', STATUS_CODE.NOT_FOUND));
  }

  // Set user and access token in request
  req.user = user;
  req.accessToken = token;

  next();
};

export default authenticate;
