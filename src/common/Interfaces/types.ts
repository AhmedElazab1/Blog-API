import { Request } from 'express';
import type { IUser } from '../../models/types/types';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      accessToken?: string;
    }
  }
}

declare global {
  namespace Express {
    interface ITokenPayload extends JwtPayload {
      id: string;
    }
  }
}
