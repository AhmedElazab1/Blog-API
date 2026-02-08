import { Request } from 'express';
import type { IUser } from '../../models/types/types';
import { JwtPayload } from 'jsonwebtoken';

export interface IRequest extends Request {
  user?: IUser;
  accessToken?: string;
}

export interface ITokenPayload extends JwtPayload {
  id: string;
}
