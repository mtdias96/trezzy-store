import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { SessionTokens } from '@/features/shared/auth/data/api';
import { readSession } from '@/features/shared/auth/model/access-token';
import { PANEL_SIGN_IN } from '@/features/shared/auth/model/paths';
import type { Session } from '@/features/shared/auth/model/types';

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, SESSION_COOKIE_OPTIONS } from './cookies';

const REMEMBER_FOR_SECONDS = 30 * 24 * 60 * 60;

// O cache do React lê o cookie uma vez por requisição, mesmo com várias páginas e queries chamando.
export const getSession = cache(async (): Promise<Session | null> => {
  return readSession((await cookies()).get(ACCESS_TOKEN_COOKIE)?.value);
});

// Toda query e action do painel começa por aqui: o proxy só faz o redirect otimista.
export async function requireAdminSession(): Promise<Session> {
  const session = await getSession();

  if (!session?.isAdmin) {
    redirect(PANEL_SIGN_IN);
  }

  return session;
}

// Os tokens só saem deste módulo para chamar a API: nunca para um componente.
export async function getAccessToken(): Promise<string | null> {
  if (!(await getSession())) {
    return null;
  }

  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

// Só em Server Action: componente de servidor não grava cookie.
// Com "Manter conectado", o access token vive o quanto vale e o refresh token, 30 dias. Sem ele, os dois somem
// quando o browser fecha.
export async function createSession(
  { accessToken, refreshToken, expiresIn }: SessionTokens,
  { remember }: { remember: boolean },
): Promise<void> {
  const store = await cookies();

  store.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    remember ? { ...SESSION_COOKIE_OPTIONS, maxAge: expiresIn } : SESSION_COOKIE_OPTIONS,
  );
  store.set(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    remember ? { ...SESSION_COOKIE_OPTIONS, maxAge: REMEMBER_FOR_SECONDS } : SESSION_COOKIE_OPTIONS,
  );
}

export async function deleteSession(): Promise<void> {
  const store = await cookies();

  // O delete repete Secure e Path=/: sem eles, o browser recusa apagar um cookie __Host-.
  store.delete({ name: ACCESS_TOKEN_COOKIE, ...SESSION_COOKIE_OPTIONS });
  store.delete({ name: REFRESH_TOKEN_COOKIE, ...SESSION_COOKIE_OPTIONS });
}
