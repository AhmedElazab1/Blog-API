import { Response, NextFunction } from 'express';
import { UserRole } from '../../models/types/types';
import ApiErrorHandler from '../utils/ApiError';
import { IRequest } from '../Interfaces/types';
import { STATUS_CODE } from '../constants/constants';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: IRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new ApiErrorHandler('Please login to access this route', STATUS_CODE.UNAUTHORIZED),
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiErrorHandler(
          'You do not have permission to perform this action',
          STATUS_CODE.FORBIDDEN,
        ),
      );
    }
    next();
  };
};

export const restrictedTo = authorize;
