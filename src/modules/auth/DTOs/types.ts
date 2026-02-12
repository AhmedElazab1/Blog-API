import { z } from 'zod';
import { userRegisterSchema, userLoginSchema } from '../validation/Auth.validation';
import { Types } from 'mongoose';
import { partial } from 'zod/v4/core/util.cjs';

export type UserRequestDTO = z.infer<typeof userRegisterSchema>;

export interface UserResponseDTO {
  _id: Types.ObjectId;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    x?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export type RegisterRequestDTO = z.infer<typeof userRegisterSchema>;

export interface RegisterResponseDTO {
  username: string;
  email: string;
}

export type LoginRequestDTO = z.infer<typeof userLoginSchema>;

export interface LoginResponseDTO {
  user: UserResponseDTO;
  accessToken: string;
  refreshToken: string;
}

export interface CreateRefreshTokenInput {
  userId: Types.ObjectId;
}

export interface RefreshTokenResponse {
  refreshToken: string;
  expiresAt: Date;
  userId: Types.ObjectId;
}
