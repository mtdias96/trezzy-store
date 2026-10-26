import * as z from 'zod';

import type { Session } from '@/features/shared/auth/model/types';

// Escrito pelo trigger PreTokenGeneration da api/ para quem está no grupo admin do Cognito.
export const ADMIN_SCOPE = 'trezzy/admin';

const claimsSchema = z.object({
  exp: z.number(),
  internalId: z.string().min(1),
  scope: z.string().default(''),
});

// Lê o access token sem validar a assinatura: serve só para decidir o que mostrar e para onde redirecionar.
// Quem valida o token é o API Gateway, em toda chamada; um token forjado não traz dado nenhum.
// Token expirado, malformado ou sem o internalId (que a api/ exige nas rotas privadas) não vira sessão.
// O `now` vem de quem chama: num componente de servidor, ler a hora exige `await io()` antes (ver session.ts).
export function readSession(token: string | undefined, now: number): Session | null {
  const payload = token?.split('.')[1];

  if (!payload) {
    return null;
  }

  let claims: unknown;

  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  const parsed = claimsSchema.safeParse(claims);

  if (!parsed.success || parsed.data.exp * 1000 <= now) {
    return null;
  }

  const { exp, internalId, scope } = parsed.data;

  return {
    accountId: internalId,
    isAdmin: scope.split(' ').includes(ADMIN_SCOPE),
    expiresAt: exp * 1000,
  };
}
