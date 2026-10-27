'use server';

import type { Route } from 'next';
import { redirect } from 'next/navigation';
import * as z from 'zod';

import { readSession } from '@/features/shared/auth/model/access-token';
import { PANEL_SIGN_IN } from '@/features/shared/auth/model/paths';
import { signInSchema } from '@/features/shared/auth/model/schema';
import { createSession, deleteSession, getRefreshToken } from '@/features/shared/auth/session/session';
import type { ActionResult } from '@/lib/action-result';
import { HttpError, isRequestFailure } from '@/lib/http';

import { requestSignIn, requestSignOut, type SessionTokens } from './api';

// Erros que a API devolve no login, na linguagem de quem usa o painel. O resto vira SIGN_IN_UNAVAILABLE.
const SIGN_IN_ERRORS: Partial<Record<number, string>> = {
  401: 'E-mail ou senha incorretos.',
  403: 'Sua conta ainda não foi confirmada.',
};

const SIGN_IN_UNAVAILABLE = 'Não foi possível entrar agora. Tente de novo em instantes.';

export async function signInToPanel(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const typedEmail = formData.get('email');
  const values = typeof typedEmail === 'string' ? { email: typedEmail } : undefined;
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      error: 'Confira os campos destacados.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const { email, password, remember, next } = parsed.data;
  let tokens: SessionTokens;

  try {
    tokens = await requestSignIn({ email, password });
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    const message = error instanceof HttpError ? SIGN_IN_ERRORS[error.status] : undefined;

    return { ok: false, error: message ?? SIGN_IN_UNAVAILABLE, values };
  }

  if (!readSession(tokens.accessToken, Date.now())?.isAdmin) {
    // A conta existe, mas não é admin: revoga os tokens que acabaram de sair em vez de guardá-los.
    await requestSignOut(tokens.refreshToken).catch(ignoreRequestFailure);

    return { ok: false, error: 'Esta conta não tem acesso ao painel.', values };
  }

  await createSession(tokens, { remember });
  redirect(next as Route);
}

export async function signOut(): Promise<void> {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    // Revogar é melhor esforço: se a API falhar, o logout local segue e o access token expira sozinho.
    await requestSignOut(refreshToken).catch(ignoreRequestFailure);
  }

  await deleteSession();
  redirect(PANEL_SIGN_IN);
}

function ignoreRequestFailure(error: unknown): void {
  if (!isRequestFailure(error)) {
    throw error;
  }
}
