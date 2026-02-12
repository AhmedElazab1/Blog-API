import { IUser } from '../../../models/types/types';
import { UserResponseDTO } from '../DTOs/types';

export function sanitizeUser(user: IUser): UserResponseDTO;
export function sanitizeUser(user: IUser[]): UserResponseDTO[];
export function sanitizeUser(user: IUser | IUser[]): UserResponseDTO | UserResponseDTO[] {
  if (Array.isArray(user)) {
    return user.map((u) => sanitizeUser(u));
  }

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    socialLinks: user.socialLinks,
  };
}
