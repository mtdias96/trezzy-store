// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { ADMIN_SCOPE } from '@/features/shared/auth/model/access-token';

import { ACCESS_TOKEN_COOKIE } from './cookies';
import { guardPanel } from './guard';

function token(claims: Record<string, unknown>) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');

  return `${encode({ alg: 'RS256' })}.${encode(claims)}.assinatura`;
}

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;

function request(path: string, accessToken?: string) {
  const headers = accessToken ? { cookie: `${ACCESS_TOKEN_COOKIE}=${accessToken}` } : undefined;

  return new NextRequest(new URL(path, 'http://localhost:3000'), { headers });
}

describe('guardPanel', () => {
  it('lets the sign-in page through without a session', () => {
    expect(guardPanel(request('/admin/entrar')).headers.get('location')).toBeNull();
  });

  it('sends a visitor without a session to the sign-in page, keeping where they were going', () => {
    const response = guardPanel(request('/admin/pedidos?status=pago'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/admin/entrar?next=%2Fadmin%2Fpedidos%3Fstatus%3Dpago',
    );
  });

  it('does not add ?next= for the panel home', () => {
    expect(guardPanel(request('/admin')).headers.get('location')).toBe('http://localhost:3000/admin/entrar');
  });

  it('keeps the query of the panel home', () => {
    expect(guardPanel(request('/admin?aba=resumo')).headers.get('location')).toBe(
      'http://localhost:3000/admin/entrar?next=%2Fadmin%3Faba%3Dresumo',
    );
  });

  it('lets an admin session through', () => {
    const accessToken = token({ exp: inOneHour(), internalId: 'acc-1', scope: ADMIN_SCOPE });

    expect(guardPanel(request('/admin', accessToken)).headers.get('location')).toBeNull();
  });

  it.each([
    ['a customer session', token({ exp: inOneHour(), internalId: 'acc-1' })],
    ['an expired admin session', token({ exp: Math.floor(Date.now() / 1000) - 1, internalId: 'acc-1', scope: ADMIN_SCOPE })],
    ['a malformed cookie', 'nao-e-jwt'],
  ])('sends %s to the sign-in page', (_case, accessToken) => {
    expect(guardPanel(request('/admin', accessToken)).headers.get('location')).toBe('http://localhost:3000/admin/entrar');
  });
});
