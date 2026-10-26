import { describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@application/errors/ValidationError';
import type { SignInUseCase } from '@application/useCases/auth/SignInUseCase';

import { SignInController } from './SignInController';

const tokens = { accessToken: 'access', refreshToken: 'refresh', expiresIn: 3600 };

function makeSut() {
  const signInUseCase = { execute: vi.fn<SignInUseCase['execute']>().mockResolvedValue(tokens) };
  const sut = new SignInController(signInUseCase as unknown as SignInUseCase);

  return { sut, signInUseCase };
}

const request = (body: unknown) => ({ body, params: {}, queryParams: {}, accountId: null });

describe('SignInController', () => {
  it('returns the tokens', async () => {
    const { sut, signInUseCase } = makeSut();

    await expect(sut.execute(request({ email: 'A@b.com', password: 'whatever' }))).resolves.toEqual({
      statusCode: 200,
      body: tokens,
    });
    expect(signInUseCase.execute).toHaveBeenCalledWith({ email: 'a@b.com', password: 'whatever' });
  });

  it('rejects a body without password', async () => {
    const { sut, signInUseCase } = makeSut();

    await expect(sut.execute(request({ email: 'a@b.com' }))).rejects.toBeInstanceOf(ValidationError);
    expect(signInUseCase.execute).not.toHaveBeenCalled();
  });
});
