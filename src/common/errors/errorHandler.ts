import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { STATUS, STATUS_CODE } from '../constants/constants';
import env from '../../config/env';

const sendErrorDev = (err: ApiError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err: ApiError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Error not handled:', err);
    res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const handleDuplicateFieldsDB = (err: ApiError) => {
  const message = `Duplicate field value: ${err.message}`;
  return new ApiError(message, STATUS_CODE.BAD_REQUEST);
};

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(message, STATUS_CODE.BAD_REQUEST);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((error: any) => error.message);
  const message = `Invalid input data: ${errors.join(', ')}`;
  return new ApiError(message, STATUS_CODE.BAD_REQUEST);
};

const handleJWTError = () => {
  const message = 'Invalid token. Please log in again!';
  return new ApiError(message, STATUS_CODE.UNAUTHORIZED);
};

const handleJWTExpiredError = () => {
  const message = 'Your token has expired! Please log in again.';
  return new ApiError(message, STATUS_CODE.UNAUTHORIZED);
};

const globalErrorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR;
  const status = err.status || STATUS.ERROR;

  res.status(statusCode).json({
    status,
    message: err.message,
  });

  if (env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = err;
    error.message = err.message;
    error.name = err.name;
    error.statusCode = statusCode;
    error.status = status;

    if (error.statusCode === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
