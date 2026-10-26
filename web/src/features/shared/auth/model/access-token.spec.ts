// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { ADMIN_SCOPE, readSession } from '@/features/shared/auth/model/access-token';

const NOW = Date.UTC(2026, 9, 26, 12);
const IN_ONE_HOUR = NOW / 1000 + 3600;

function token(claims: Record<string, unknown>) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');

  return `${encode({ alg: 'RS256' })}.${encode(claims)}.assinatura`;
}

describe('readSession', () => {
  it('reads the account and the expiry from the access token', () => {
    const session = readSession(token({ exp: IN_ONE_HOUR, internalId: 'acc-1', scope: 'aws.cognito.signin.user.admin' }), NOW);

    expect(session).toEqual({ accountId: 'acc-1', isAdmin: false, expiresAt: IN_ONE_HOUR * 1000 });
  });

  it('marks the session as admin when the token has the admin scope', () => {
    const session = readSession(token({ exp: IN_ONE_HOUR, internalId: 'acc-1', scope: `openid ${ADMIN_SCOPE}` }), NOW);

    expect(session?.isAdmin).toBe(true);
  });

  it('returns null for an expired token', () => {
    expect(readSession(token({ exp: NOW / 1000, internalId: 'acc-1' }), NOW)).toBeNull();
  });

  it('returns null for a token without the internalId claim', () => {
    expect(readSession(token({ exp: IN_ONE_HOUR, scope: ADMIN_SCOPE }), NOW)).toBeNull();
  });

  it.each([
    ['no token', undefined],
    ['an empty token', ''],
    ['a token without payload', 'header'],
    ['a payload that is not JSON', 'header.bm90LWpzb24.assinatura'],
  ])('returns null for %s', (_case, value) => {
    expect(readSession(value, NOW)).toBeNull();
  });
});
