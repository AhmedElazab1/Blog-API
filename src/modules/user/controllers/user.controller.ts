import { Request, Response } from 'express';
import catchAsync from '../../../common/utils/catchAsync';
import {
  deleteCurrentUserService,
  getAllUsersService,
  updateCurrentUserService,
  getUserByIdService,
  deleteUserByIdService,
} from '../services/user.service';
import { UpdateUserDTO, IQueryStr, ParamsIdDTO } from '../DTOs/types';
import logger from '../../../common/utils/logger';
import { STATUS_CODE } from '../../../common/constants/responseCode';
import { STATUS } from '../../../common/constants/responseStatus';

export const updateCurrentUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const payload: UpdateUserDTO = req.body;
  const user = await updateCurrentUserService(req.user!._id, payload);

  logger.info(`User updated successfully: ${user}`);

  res.status(STATUS_CODE.SUCCESS).json({
    success: STATUS.SUCCESS,
    message: 'User updated successfully',
    data: user,
  });
});

export const deleteCurrentUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  await deleteCurrentUserService(req.user!._id);

  res.status(STATUS_CODE.NO_CONTENT).end();
});

export const getAllUsers = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const query = req.query;
  const users = await getAllUsersService(query);

  logger.info(`Users fetched successfully: ${users}`);

  res.status(STATUS_CODE.SUCCESS).json({
    success: STATUS.SUCCESS,
    message: 'Users fetched successfully',
    data: users,
  });
});

export const getUserById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id as string;
  const user = await getUserByIdService(userId);

  logger.info(`User fetched successfully: ${user}`);

  res.status(STATUS_CODE.SUCCESS).json({
    success: STATUS.SUCCESS,
    message: 'User fetched successfully',
    data: user,
  });
});

export const deleteUserById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id as string;
  await deleteUserByIdService(userId);

  res.status(STATUS_CODE.NO_CONTENT).end();
});
