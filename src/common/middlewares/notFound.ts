// Custom modules
import logger from '../utils/logger';
import { STATUS, STATUS_CODE } from '../constants/constants';

// Types
import type { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  logger.error(`Route cannot be found`, {
    route: req.originalUrl,
    status: STATUS.ERROR,
    statusCode: STATUS_CODE.NOT_FOUND,
  });
  res.status(STATUS_CODE.NOT_FOUND).json({
    status: STATUS_CODE.NOT_FOUND,
    message: `Route ${req.originalUrl} cannot be found`,
  });
};
