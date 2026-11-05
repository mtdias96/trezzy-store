import 'server-only';

import { redirect } from 'next/navigation';
import type * as z from 'zod';

import { PANEL_SIGN_IN } from '@/features/shared/auth/model/paths';
import { type ApiPath, http, HttpError, type HttpOptions } from '@/lib/http';

import { getAccessToken } from './session';

// Chamada à API em nome de quem está logado: manda o access token e, se a API recusar o token (401), volta ao login.
// Por enquanto só o painel tem área logada, por isso o login é o dele.
export async function authorizedHttp<TSchema extends z.ZodType>(
  path: ApiPath,
  { headers, ...options }: HttpOptions<TSchema>,
) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    redirect(PANEL_SIGN_IN);
  }

  const requestHeaders = new Headers(headers);
  requestHeaders.set('Authorization', `Bearer ${accessToken}`);

  try {
    return await http(path, { ...options, headers: requestHeaders });
  } catch (error) {
    if (!(error instanceof HttpError && error.status === 401)) {
      throw error;
    }
  }

  // Fora do try: o redirect() funciona lançando uma exceção, que o catch engoliria.
  redirect(PANEL_SIGN_IN);
}
