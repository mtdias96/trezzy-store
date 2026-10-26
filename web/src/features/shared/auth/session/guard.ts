import { type NextRequest, NextResponse } from 'next/server';

import { readSession } from '@/features/shared/auth/model/access-token';
import { PANEL_HOME, PANEL_SIGN_IN } from '@/features/shared/auth/model/paths';

import { ACCESS_TOKEN_COOKIE } from './cookies';

// Redirect otimista do painel, chamado pelo proxy.ts. Ele roda em toda navegação (até no prefetch), então só lê o
// cookie e não chama a API. A checagem real fica perto do dado: requireAdminSession() e a API em toda chamada.
// Quem está logado e abre o login vê o formulário: mandá-lo ao painel com um token revogado criaria um loop.
export function guardPanel(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  if (pathname === PANEL_SIGN_IN) {
    return NextResponse.next();
  }

  if (readSession(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value)?.isAdmin) {
    return NextResponse.next();
  }

  const signInUrl = new URL(PANEL_SIGN_IN, request.url);
  const destination = `${pathname}${search}`;

  if (destination !== PANEL_HOME) {
    signInUrl.searchParams.set('next', destination);
  }

  return NextResponse.redirect(signInUrl);
}
