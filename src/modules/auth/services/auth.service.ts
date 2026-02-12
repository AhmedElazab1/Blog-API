import User from '../../../models/User';
import { hashPassword, comparePassword } from '../../../common/utils/mongoose-utils';
import { sanitizeUser } from '../mappers/user.mapper';
import {
  UserRequestDTO,
  UserResponseDTO,
  LoginRequestDTO,
  LoginResponseDTO,
  RefreshTokenResponse,
  RegisterResponseDTO,
  RegisterRequestDTO,
} from '../DTOs/types';
import AppError from '../../../common/utils/ApiError';
import { STATUS_CODE } from '../../../common/constants/constants';
import { generateAccessToken } from './token.service';
import {
  createRefreshToken,
  validateRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
} from './refresh.service';
import { blacklistAccessToken } from './blacklist.service';
import { Response } from 'express';
import env from '../../../config/env';
import ms from 'ms';
import RefreshToken from '../../../models/RefreshToken';
import { Types } from 'mongoose';
import Email from '../../../common/utils/Email';
import logger from '../../../common/utils/logger';

export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ms(env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue),
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const signupService = async (
  data: RegisterRequestDTO,
  url: string,
): Promise<RegisterResponseDTO> => {
  const { username, email, password } = data;

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  // Send welcome email
  try {
    const sendEmail = new Email(user, url);
    await sendEmail.sendWelcome();
  } catch (err) {
    logger.error('Error sending welcome email:', err);
  }

  // Return sanitized user
  return sanitizeUser(user);
};

export const loginService = async (data: LoginRequestDTO): Promise<LoginResponseDTO> => {
  const { email, password } = data;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', STATUS_CODE.UNAUTHORIZED);
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', STATUS_CODE.UNAUTHORIZED);
  }

  // Generate access token
  const accessToken = generateAccessToken(user._id);

  // Generate refresh token
  const { refreshToken } = await createRefreshToken({
    userId: user._id,
  });

  // Return sanitized user and tokens
  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

export const refreshService = async (
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Validate refresh token
  const decodedToken = await validateRefreshToken(refreshToken);

  // Generate new access token
  const newAccessToken = generateAccessToken(decodedToken.userId);

  // Rotate refresh token
  const { refreshToken: newRefreshToken } = await rotateRefreshToken(
    refreshToken,
    decodedToken.userId,
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutService = async (accessToken: string, refreshToken: string): Promise<void> => {
  // Blacklist access token
  await blacklistAccessToken(accessToken);

  // Revoke refresh token
  await revokeRefreshToken(refreshToken);
};

export const logoutAllService = async (userId: string, accessToken: string): Promise<void> => {
  // Blacklist access token
  await blacklistAccessToken(accessToken);

  // Revoke all refresh tokens for the user
  await revokeAllRefreshTokens(userId);
};

export const getCurrentUserService = async (userId: Types.ObjectId): Promise<UserResponseDTO> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', STATUS_CODE.NOT_FOUND);
  }
  return sanitizeUser(user) as UserResponseDTO;
};

export const getActiveSessionsService = async (userId: string) => {
  const sessions = await RefreshToken.find({
    userId,
    revoked: false,
    expiresAt: { $gte: new Date() },
  })
    .select('userId expiresAt')
    .sort({ createdAt: -1 });
  return sessions;
};

export const googleCallbackService = async (
  userId: Types.ObjectId,
): Promise<{ accessToken: string; refreshToken: RefreshTokenResponse }> => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = await createRefreshToken({ userId });
  return { accessToken, refreshToken };
};
