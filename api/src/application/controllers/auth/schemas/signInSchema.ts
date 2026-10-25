import * as z from 'zod';

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(256),
});

export type SignInBody = z.infer<typeof signInSchema>;
