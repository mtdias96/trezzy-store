import { describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@application/errors/ValidationError';
import type { SignOutUseCase } from '@application/useCases/auth/SignOutUseCase';

import { SignOutController } from './SignOutController';

function makeSut() {
  const signOutUseCase = { execute: vi.fn<SignOutUseCase['execute']>().mockResolvedValue() };
  const sut = new SignOutController(signOutUseCase as unknown as SignOutUseCase);

  return { sut, signOutUseCase };
}

const request = (body: unknown) => ({ body, params: {}, queryParams: {}, accountId: null });

describe('SignOutController', () => {
  it('revokes the refresh token and answers 204 without body', async () => {
    const { sut, signOutUseCase } = makeSut();

    await expect(sut.execute(request({ refreshToken: 'refresh-1' }))).resolves.toEqual({ statusCode: 204 });
    expect(signOutUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'refresh-1' });
  });

  it('rejects a body without refreshToken', async () => {
    const { sut, signOutUseCase } = makeSut();

    await expect(sut.execute(request({}))).rejects.toBeInstanceOf(ValidationError);
    expect(signOutUseCase.execute).not.toHaveBeenCalled();
  });
});
