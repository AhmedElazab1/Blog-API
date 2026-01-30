import { Request } from 'express';
import type { IUser } from '../../models/types/types';

export interface IRequest extends Request {
  user?: IUser;
  accessToken?: string;
}
