import * as z from 'zod';

// Espelha a PasswordPolicy do UserPool (sls/resources/cognito.yml): mudou lá, muda aqui.
export const signUpSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  password: z
    .string()
    .min(8)
    .max(256)
    .regex(/[a-z]/, 'Password must contain a lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
    .regex(/[0-9]/, 'Password must contain a number.'),
});

export type SignUpBody = z.infer<typeof signUpSchema>;
