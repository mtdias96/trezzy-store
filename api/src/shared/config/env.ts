import { z } from 'zod';

const schema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
});

export const env = schema.parse(process.env);

