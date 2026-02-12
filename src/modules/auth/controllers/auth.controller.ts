import { Request, Response } from 'express';
import catchAsync from '../../../common/utils/catchAsync';
import { LoginRequestDTO, UserRequestDTO } from '../DTOs/types';
import logger from '../../../common/utils/logger';
import { STATUS_CODE, STATUS } from '../../../common/constants/constants';
import {
  signupService,
  loginService,
  setRefreshTokenCookie,
  refreshService,
  logoutService,
  clearRefreshTokenCookie,
  logoutAllService,
  getActiveSessionsService,
  googleCallbackService,
  getCurrentUserService,
} from '../services/auth.service';
import AppError from '../../../common/utils/ApiError';
import { Types } from 'mongoose';
import { generateAccessToken } from '../services/token.service';
import { createRefreshToken } from '../services/refresh.service';

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Get data from request body
  const data = req.body;
  const url = `${req.protocol}://${req.get('host')}`;
  const { username, email } = await signupService(data, url);

  logger.info('User registered successfully');

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User registered successfully',
    data: {
      username,
      email,
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Get data from request body
  const data = req.body;
  const { user, refreshToken, accessToken } = await loginService(data);

  logger.info('User logged in successfully');

  // Set refresh token cookie
  setRefreshTokenCookie(res, refreshToken);

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User logged in successfully',
    data: {
      user,
      accessToken,
    },
  });
});

export const refresh = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Get refresh token from cookie
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError('Refresh token not found', STATUS_CODE.UNAUTHORIZED);
  }

  const { accessToken, refreshToken: newRefreshToken } = await refreshService(refreshToken);

  logger.info('Token refreshed successfully');

  // Set refresh token cookie
  setRefreshTokenCookie(res, newRefreshToken);

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    token: accessToken,
  });
});

export const logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Get access token from request headers
  const accessToken = req.accessToken;
  // Get refresh token from request cookies
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError('Refresh token not found', STATUS_CODE.UNAUTHORIZED);
  }

  await logoutService(accessToken as string, refreshToken);

  logger.info('User logged out successfully');

  // Clear refresh token cookie
  clearRefreshTokenCookie(res);

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User logged out successfully',
  });
});

export const logoutAll = catchAsync(async (req: Request, res: Response): Promise<void> => {
  await logoutAllService(req.user!._id.toString(), req.accessToken!);

  logger.info('User logged out successfully');

  // Clear refresh token cookie
  clearRefreshTokenCookie(res);

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User logged out successfully',
  });
});

export const getCurrentUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await getCurrentUserService(req.user!._id);

  logger.info('User retrieved successfully');

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User retrieved successfully',
    data: user,
  });
});

export const getActiveSessions = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const sessions = await getActiveSessionsService(req.user!._id.toString());

  logger.info('Active sessions retrieved successfully');

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Active sessions retrieved successfully',
    data: sessions,
  });
});

export const googleCallback = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  const { accessToken, refreshToken } = await googleCallbackService(user!._id);

  setRefreshTokenCookie(res, refreshToken.refreshToken);

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'User logged in successfully',
    data: {
      user,
      accessToken,
    },
  });
});
