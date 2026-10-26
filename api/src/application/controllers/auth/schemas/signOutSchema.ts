import * as z from 'zod';

// O refresh token do Cognito é um JWE de ~1,8 KB; o teto só evita payload abusivo.
export const signOutSchema = z.object({
  refreshToken: z.string().min(1).max(4096),
});

export type SignOutBody = z.infer<typeof signOutSchema>;
