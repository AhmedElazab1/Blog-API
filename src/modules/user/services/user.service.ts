import { Types } from 'mongoose';
import { UpdateUserDTO } from '../DTOs/types';
import User from '../../../models/User';
import { sanitizeUser } from '../../auth/mappers/user.mapper';
import { UserResponseDTO } from '../../auth/DTOs/types';
import { STATUS_CODE } from '../../../common/constants/responseCode';
import AppError from '../../../common/utils/ApiError';
import APIFeatures from '../../../common/utils/ApiFeatures';
import { IQueryStr } from '../DTOs/types';
import { IUser } from '../../../models/types/types';

export const updateCurrentUserService = async (
  userId: Types.ObjectId,
  payload: UpdateUserDTO,
): Promise<UserResponseDTO> => {
  const user = await User.findByIdAndUpdate(userId, payload, { new: true });

  if (!user) {
    throw new AppError('User not found', STATUS_CODE.NOT_FOUND);
  }

  return sanitizeUser(user);
};

export const deleteCurrentUserService = async (userId: Types.ObjectId): Promise<void> => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError('User not found', STATUS_CODE.NOT_FOUND);
  }
};

export const getAllUsersService = async (query: IQueryStr): Promise<UserResponseDTO[]> => {
  const features = new APIFeatures(User.find(), query).filter().sort().limitFields().paginate();

  const users = await features.query;

  return sanitizeUser(users);
};

export const getUserByIdService = async (userId: string): Promise<UserResponseDTO> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', STATUS_CODE.NOT_FOUND);
  }

  return sanitizeUser(user);
};

export const deleteUserByIdService = async (userId: string): Promise<void> => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError('User not found', STATUS_CODE.NOT_FOUND);
  }
};
