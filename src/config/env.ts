import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional(),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  throw new Error('Invalid environment variables');
}

export default {
  NODE_ENV: env.data.NODE_ENV,
  PORT: env.data.PORT,
  MONGODB_URI: env.data.MONGODB_URI,
  JWT_SECRET: env.data.JWT_SECRET,
  JWT_EXPIRES_IN: env.data.JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN: env.data.REFRESH_TOKEN_EXPIRES_IN,
};
