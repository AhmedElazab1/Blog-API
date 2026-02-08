import AccessTokenBlacklist from '../../../models/AccessTokenBlacklist';
import { getTokenExpiryDate } from './token.service';

export const blacklistAccessToken = async (token: string): Promise<void> => {
  // Get token expiry date
  const expiresAt = getTokenExpiryDate(token);
  // Set default expiry date
  const defaultExpiry = new Date(Date.now() + 1000 * 60 * 60);
  // Set final expiry date
  const finalExpiry = expiresAt || defaultExpiry;

  // Check if token is not expired
  if (finalExpiry > new Date()) {
    // Add token to blacklist
    await AccessTokenBlacklist.findOneAndUpdate(
      { token },
      {
        $setOnInsert: {
          token,
          expiresAt: finalExpiry,
        },
      },
      {
        upsert: true,
        new: false,
      },
    );
  }
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const blacklistedToken = await AccessTokenBlacklist.findOne({
    token,
  });

  return !!blacklistedToken;
};

export const cleanupExpiredBlacklistedTokens = async (): Promise<number> => {
  const expiredTokens = await AccessTokenBlacklist.find({
    expiresAt: { $lt: new Date() },
  });

  await AccessTokenBlacklist.deleteMany({
    expiresAt: { $lt: new Date() },
  });

  return expiredTokens.length;
};
