import z from 'zod';
import { paramsIdSchema, updateUserSchema, usersQuerySchema } from '../validation/user.validation';

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

export interface IQueryStr {
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
  [key: string]: any;
}

export type ParamsIdDTO = z.infer<typeof paramsIdSchema>;
