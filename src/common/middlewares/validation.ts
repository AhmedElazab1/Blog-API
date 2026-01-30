import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { fromError } from 'zod-validation-error';
import { STATUS, STATUS_CODE } from '../constants/constants';
import logger from '../utils/logger';

function parse<T>(schema: ZodSchema<T>, data: unknown, res: Response): undefined | T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error: ZodError = result.error;
    const validationError = fromError(error);
    res.status(STATUS_CODE.BAD_REQUEST).json({
      status: STATUS.FAIL,
      message: validationError,
    });
    logger.error('Validation Error: ', validationError);
    return undefined;
  }
  return result.data;
}

export const validate = <B, R, Q, P>(schema: {
  params?: ZodSchema<P>;
  body?: ZodSchema<B>;
  query?: ZodSchema<Q>;
}) => {
  return (req: Request<P, R, B, Q>, res: Response, next: NextFunction) => {
    if (schema.body) {
      const validateBody = parse(schema.body, req.body, res);
      if (validateBody === undefined) return;
      req.body = validateBody;
    }
    if (schema.query) {
      const validateQuery = parse(schema.query, req.query, res);
      if (validateQuery === undefined) return;
      req.query = validateQuery;
    }
    if (schema.params) {
      const validateParams = parse(schema.params, req.params, res);
      if (validateParams === undefined) return;
      req.params = validateParams;
    }
    next();
  };
};
