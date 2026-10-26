import { describe, expect, it, vi } from 'vitest';

import type { AuthGateway } from '@infra/gateways/AuthGateway';

import { SignOutUseCase } from './SignOutUseCase';

describe('SignOutUseCase', () => {
  it('revokes the refresh token in the auth provider', async () => {
    const authGateway = { signOut: vi.fn<AuthGateway['signOut']>().mockResolvedValue() };
    const sut = new SignOutUseCase(authGateway as unknown as AuthGateway);

    await sut.execute({ refreshToken: 'refresh-1' });

    expect(authGateway.signOut).toHaveBeenCalledWith({ refreshToken: 'refresh-1' });
  });
});
