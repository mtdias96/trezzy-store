// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as z from 'zod';

import { signInToPanel, signOut } from '@/features/shared/auth/data/actions';
import { requestSignIn, requestSignOut } from '@/features/shared/auth/data/api';
import { ADMIN_SCOPE } from '@/features/shared/auth/model/access-token';
import { createSession, deleteSession, getRefreshToken } from '@/features/shared/auth/session/session';
import { HttpError } from '@/lib/http';

vi.mock('@/config/env', () => ({ env: { API_URL: 'https://api.test' } }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));
vi.mock('@/features/shared/auth/data/api', () => ({ requestSignIn: vi.fn(), requestSignOut: vi.fn() }));
vi.mock('@/features/shared/auth/session/session', () => ({
  createSession: vi.fn(),
  deleteSession: vi.fn(),
  getRefreshToken: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(requestSignOut).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

function token(claims: Record<string, unknown>) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');

  return `${encode({ alg: 'RS256' })}.${encode(claims)}.assinatura`;
}

function tokens(scope = ADMIN_SCOPE) {
  return {
    accessToken: token({ exp: Math.floor(Date.now() / 1000) + 3600, internalId: 'acc-1', scope }),
    refreshToken: 'refresh-1',
    expiresIn: 3600,
  };
}

function form(fields: Record<string, string>) {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.append(key, value));

  return data;
}

const validForm = () => form({ email: 'Admin@Trezzy.com.br', password: 'segredo', remember: 'on' });

describe('signInToPanel', () => {
  it('returns the field errors without calling the API', async () => {
    const result = await signInToPanel(null, form({ email: 'nao-e-email', password: '' }));

    expect(result).toMatchObject({ ok: false, fieldErrors: { email: ['Informe um e-mail válido.'] } });
    expect(requestSignIn).not.toHaveBeenCalled();
  });

  it('creates the session and goes to the panel page the admin was trying to open', async () => {
    vi.mocked(requestSignIn).mockResolvedValue(tokens());
    const data = validForm();
    data.append('next', '/admin/pedidos');

    await expect(signInToPanel(null, data)).rejects.toThrow('redirect:/admin/pedidos');

    expect(requestSignIn).toHaveBeenCalledWith({ email: 'admin@trezzy.com.br', password: 'segredo' });
    expect(createSession).toHaveBeenCalledWith(tokens(), { remember: true });
  });

  it('turns wrong credentials into a message and keeps the typed e-mail', async () => {
    vi.mocked(requestSignIn).mockRejectedValue(new HttpError(401, { error: { code: 'UNAUTHORIZED' } }));

    await expect(signInToPanel(null, validForm())).resolves.toEqual({
      ok: false,
      error: 'E-mail ou senha incorretos.',
      values: { email: 'Admin@Trezzy.com.br' },
    });
  });

  it.each([
    ['an API error', new HttpError(500, 'Internal Server Error')],
    ['a timeout', new DOMException('The operation timed out.', 'TimeoutError')],
  ])('asks to try again after %s', async (_case, error) => {
    vi.mocked(requestSignIn).mockRejectedValue(error);

    await expect(signInToPanel(null, validForm())).resolves.toMatchObject({
      ok: false,
      error: 'Não foi possível entrar agora. Tente de novo em instantes.',
    });
  });

  it('refuses an account without the admin scope and revokes its tokens', async () => {
    vi.mocked(requestSignIn).mockResolvedValue(tokens('aws.cognito.signin.user.admin'));

    await expect(signInToPanel(null, validForm())).resolves.toMatchObject({
      ok: false,
      error: 'Esta conta não tem acesso ao painel.',
    });
    expect(requestSignOut).toHaveBeenCalledWith('refresh-1');
    expect(createSession).not.toHaveBeenCalled();
  });

  it('lets an unexpected error propagate', async () => {
    vi.mocked(requestSignIn).mockRejectedValue(new z.ZodError([]));

    await expect(signInToPanel(null, validForm())).rejects.toBeInstanceOf(z.ZodError);
  });
});

describe('signOut', () => {
  it('revokes the refresh token, deletes the cookies and goes to the sign-in page', async () => {
    vi.mocked(getRefreshToken).mockResolvedValue('refresh-1');

    await expect(signOut()).rejects.toThrow('redirect:/admin/entrar');

    expect(requestSignOut).toHaveBeenCalledWith('refresh-1');
    expect(deleteSession).toHaveBeenCalled();
  });

  it('still signs out locally when the API is down', async () => {
    vi.mocked(getRefreshToken).mockResolvedValue('refresh-1');
    vi.mocked(requestSignOut).mockRejectedValue(new TypeError('fetch failed'));

    await expect(signOut()).rejects.toThrow('redirect:/admin/entrar');

    expect(deleteSession).toHaveBeenCalled();
  });
});
