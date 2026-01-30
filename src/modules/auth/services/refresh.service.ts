import { CreateRefreshTokenInput, RefreshTokenResponse } from '../DTOs/types';
import { generateSecureToken, hashToken } from './token.service';
import env from '../../../config/env';
import Token from '../../../models/RefreshToken';
import ms from 'ms';
import { STATUS_CODE } from '../../../common/constants/responseCode';
import AppError from '../../../common/utils/ApiError';
import { Types } from 'mongoose';

export const createRefreshToken = async (
  input: CreateRefreshTokenInput,
): Promise<RefreshTokenResponse> => {
  const { userId } = input;

  const refreshToken = generateSecureToken();
  const hashesToken = hashToken(refreshToken);

  const expiresIn = ms(env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue);
  const expiresAt = new Date(Date.now() + expiresIn);

  await Token.create({
    token: hashesToken,
    userId,
    expiresAt,
  });

  return { refreshToken, expiresAt, userId };
};

export const validateRefreshToken = async (token: string) => {
  // hash the refresh token to compare it with the stored token in DB
  const hashedToken = hashToken(token);

  // Find refresh token in DB
  const refreshToken = await Token.findOne({
    token: hashedToken,
  });

  if (!refreshToken) {
    throw new AppError('Invalid refresh token', STATUS_CODE.UNAUTHORIZED);
  }

  // Check if refresh token has been revoked
  if (refreshToken.revoked) {
    throw new AppError('Refresh token has been revoked', STATUS_CODE.UNAUTHORIZED);
  }

  // Check if refresh token has expired
  if (refreshToken.expiresAt < new Date()) {
    throw new AppError('Refresh token has expired', STATUS_CODE.UNAUTHORIZED);
  }

  return refreshToken;
};

export const rotateRefreshToken = async (
  oldToken: string,
  userId: Types.ObjectId,
): Promise<RefreshTokenResponse> => {
  await revokeRefreshToken(oldToken);

  const refreshToken = await createRefreshToken({ userId });

  return refreshToken;
};

export const revokeRefreshToken = async (token: string) => {
  const hashedToken = hashToken(token);

  await Token.updateOne(
    {
      token: hashedToken,
    },
    {
      revoked: true,
      revokedAt: new Date(),
    },
  );
};

export const revokeAllRefreshTokens = async (userId: string) => {
  await Token.updateMany(
    {
      userId,
      revoked: false,
    },
    {
      revoked: true,
      revokedAt: new Date(),
    },
  );
};
