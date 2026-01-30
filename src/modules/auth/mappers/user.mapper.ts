import { IUser } from '../../../models/types/types';
import { UserResponseDTO } from '../DTOs/types';

export const sanitizeUser = (user: IUser): UserResponseDTO => {
  return {
    username: user.username,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    socialLinks: user.socialLinks,
  };
};
