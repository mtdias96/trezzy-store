import 'server-only';

import * as z from 'zod';

import { http } from '@/lib/http';

const sessionTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
});

export type SessionTokens = z.infer<typeof sessionTokensSchema>;

export function requestSignIn(credentials: { email: string; password: string }): Promise<SessionTokens> {
  return http('/auth/signin', { method: 'POST', body: credentials, schema: sessionTokensSchema });
}

// Revoga o refresh token no Cognito, junto com os access tokens emitidos a partir dele.
export async function requestSignOut(refreshToken: string): Promise<void> {
  await http('/auth/signout', { method: 'POST', body: { refreshToken }, schema: z.undefined() });
}
