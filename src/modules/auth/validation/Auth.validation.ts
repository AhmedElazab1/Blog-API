import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .transform((value) => {
    return value.trim();
  });

export const userRegisterSchema = z
  .object({
    username: z
      .string('Username must be a string')
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .transform((value) => {
        return value.trim();
      }),

    email: z
      .string('Email must be a string')
      .email('Invalid email format')
      .max(50, 'Email must be less than 50 characters')
      .transform((value) => {
        return value.trim();
      }),

    password: passwordSchema,
  })
  .strict();

export const userLoginSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email format')
      .transform((value) => value.trim()),
    password: passwordSchema,
  })
  .strict();
