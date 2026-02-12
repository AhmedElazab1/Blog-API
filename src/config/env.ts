import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional(),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  SMTP_HOST: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_PORT: z.string(),
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
  GOOGLE_CLIENT_ID: env.data.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: env.data.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: env.data.GOOGLE_CALLBACK_URL,
  SMTP_HOST: env.data.SMTP_HOST,
  SMTP_USER: env.data.SMTP_USER,
  SMTP_PASS: env.data.SMTP_PASS,
  SMTP_PORT: env.data.SMTP_PORT,
};
