import { describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@application/errors/ValidationError';
import type { SignUpUseCase } from '@application/useCases/auth/SignUpUseCase';

import { SignUpController } from './SignUpController';

const tokens = { accessToken: 'access', refreshToken: 'refresh', expiresIn: 3600 };

function makeSut() {
  const signUpUseCase = { execute: vi.fn<SignUpUseCase['execute']>().mockResolvedValue(tokens) };
  const sut = new SignUpController(signUpUseCase as unknown as SignUpUseCase);

  return { sut, signUpUseCase };
}

const request = (body: unknown) => ({ body, params: {}, queryParams: {}, accountId: null });

describe('SignUpController', () => {
  it('normalizes the email, delegates to the use case and returns the tokens', async () => {
    const { sut, signUpUseCase } = makeSut();

    const response = await sut.execute(request({ email: '  A@B.com ', password: 'Secret123' }));

    expect(response).toEqual({ statusCode: 201, body: tokens });
    expect(signUpUseCase.execute).toHaveBeenCalledWith({ email: 'a@b.com', password: 'Secret123' });
  });

  it('forwards only the fields the use case needs', async () => {
    const { sut, signUpUseCase } = makeSut();

    await sut.execute(request({ email: 'a@b.com', password: 'Secret123', isAdmin: true }));

    expect(signUpUseCase.execute).toHaveBeenCalledWith({ email: 'a@b.com', password: 'Secret123' });
  });

  it.each([
    { email: 'not-an-email', password: 'Secret123' },
    { email: 'a@b.com', password: 'short1A' },
    { email: 'a@b.com', password: 'nouppercase1' },
    { email: 'a@b.com', password: 'NoNumberHere' },
  ])('rejects %o before reaching the use case', async (body) => {
    const { sut, signUpUseCase } = makeSut();

    await expect(sut.execute(request(body))).rejects.toBeInstanceOf(ValidationError);
    expect(signUpUseCase.execute).not.toHaveBeenCalled();
  });
});
