import * as z from 'zod';

const schema = z.object({
  REGION: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  COGNITO_POOL_ID: z.string().min(1),
  COGNITO_CLIENT_ID: z.string().min(1),
  COGNITO_CLIENT_SECRET: z.string().min(1),
});

export const env = schema.parse(process.env);
