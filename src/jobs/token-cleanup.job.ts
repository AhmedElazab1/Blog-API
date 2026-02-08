import { cleanupExpiredTokens } from '../modules/auth/services/refresh.service';
import { cleanupExpiredBlacklistedTokens } from '../modules/auth/services/blacklist.service';
import logger from '../common/utils/logger';

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

let cleanupInterval: NodeJS.Timeout | null = null;

export const runTokenCleanup = async (): Promise<void> => {
  try {
    const [refreshTokensDeleted, blacklistTokensDeleted] = await Promise.all([
      cleanupExpiredTokens(),
      cleanupExpiredBlacklistedTokens(),
    ]);

    if (refreshTokensDeleted > 0 || blacklistTokensDeleted > 0) {
      logger.info('Token cleanup completed', {
        refreshTokensDeleted,
        blacklistTokensDeleted,
      });
    }
  } catch (error) {
    logger.error('Token cleanup job failed', { error });
  }
};

export const startTokenCleanupJob = (): void => {
  if (cleanupInterval) {
    logger.warn('Token cleanup job is already running');
    return;
  }

  runTokenCleanup();

  cleanupInterval = setInterval(runTokenCleanup, CLEANUP_INTERVAL_MS);

  logger.info('Token cleanup job started', {
    intervalMs: CLEANUP_INTERVAL_MS,
  });
};

export const stopTokenCleanupJob = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Token cleanup job stopped');
  }
};
