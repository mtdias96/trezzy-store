import { describe, expect, it, vi } from 'vitest';

import type { AuthGateway } from '@infra/gateways/AuthGateway';

import { SignInUseCase } from './SignInUseCase';

describe('SignInUseCase', () => {
  it('returns the tokens issued by the auth provider', async () => {
    const tokens = { accessToken: 'access', refreshToken: 'refresh', expiresIn: 3600 };
    const authGateway = { signIn: vi.fn<AuthGateway['signIn']>().mockResolvedValue(tokens) };
    const sut = new SignInUseCase(authGateway as unknown as AuthGateway);

    await expect(sut.execute({ email: 'a@b.com', password: 'Secret123' })).resolves.toEqual(tokens);
    expect(authGateway.signIn).toHaveBeenCalledWith({ email: 'a@b.com', password: 'Secret123' });
  });
});
