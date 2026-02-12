import z from 'zod';
import { UserRole } from '../../../models/types/types';

export const updateUserSchema = z.object({
  username: z
    .string('Username must be a string')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .transform((value) => {
      return value.trim();
    })
    .optional(),
  email: z
    .string('Email must be a string')
    .email('Invalid email format')
    .max(50, 'Email must be less than 50 characters')
    .transform((value) => {
      return value.trim();
    })
    .optional(),
  firstName: z
    .string('First name must be a string')
    .min(3, 'First name must be at least 3 characters')
    .max(20, 'First name must be less than 20 characters')
    .transform((value) => {
      return value.trim();
    })
    .optional(),
  lastName: z
    .string('Last name must be a string')
    .min(3, 'Last name must be at least 3 characters')
    .max(20, 'Last name must be less than 20 characters')
    .transform((value) => {
      return value.trim();
    })
    .optional(),
  role: z.enum(Object.values(UserRole)).optional(),
  socialLinks: z
    .object({
      website: z.string().optional(),
      facebook: z.string().optional(),
      x: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
});

export const paramsIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
});

export const usersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  field: z.string().optional(),
});
