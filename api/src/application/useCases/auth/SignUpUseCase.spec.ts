import { describe, expect, it, vi } from 'vitest';

import { Saga } from '@shared/saga/Saga';
import { Account } from '@application/entities/Account';
import { ErrorCode } from '@application/errors/ErrorCode';
import type { AccountRepository } from '@infra/database/repositories/AccountRepository';
import type { AuthGateway } from '@infra/gateways/AuthGateway';

import { SignUpUseCase } from './SignUpUseCase';

const input = { email: 'a@b.com', password: 'Secret123' };
const tokens = { accessToken: 'access', refreshToken: 'refresh', expiresIn: 3600 };

function makeSut() {
  const calls: string[] = [];
  const authGateway = {
    signUp: vi.fn<AuthGateway['signUp']>().mockResolvedValue({ externalId: 'sub-1' }),
    signIn: vi.fn<AuthGateway['signIn']>().mockResolvedValue(tokens),
    deleteUser: vi.fn<AuthGateway['deleteUser']>(async () => {
      calls.push('deleteUser');
    }),
  };
  const accountRepository = {
    findByEmail: vi.fn<AccountRepository['findByEmail']>().mockResolvedValue(null),
    create: vi.fn<AccountRepository['create']>().mockResolvedValue(),
    delete: vi.fn<AccountRepository['delete']>(async () => {
      calls.push('deleteAccount');
    }),
  };
  const sut = new SignUpUseCase(
    authGateway as unknown as AuthGateway,
    accountRepository as unknown as AccountRepository,
    new Saga(),
  );

  return { sut, authGateway, accountRepository, calls };
}

describe('SignUpUseCase', () => {
  it('registers in Cognito with our id, persists the account and signs in', async () => {
    const { sut, authGateway, accountRepository } = makeSut();

    await expect(sut.execute(input)).resolves.toEqual(tokens);

    const internalId = authGateway.signUp.mock.calls[0]![0].internalId;
    const [account] = accountRepository.create.mock.calls[0]!;
    expect(account).toBeInstanceOf(Account);
    expect(account).toMatchObject({ id: internalId, email: 'a@b.com', externalId: 'sub-1' });
    expect(authGateway.signIn).toHaveBeenCalledWith(input);
    expect(authGateway.deleteUser).not.toHaveBeenCalled();
  });

  it('rejects an email already in use before touching Cognito', async () => {
    const { sut, authGateway, accountRepository } = makeSut();
    accountRepository.findByEmail.mockResolvedValue(new Account({ email: 'a@b.com', externalId: 'sub-0' }));

    await expect(sut.execute(input)).rejects.toMatchObject({ code: ErrorCode.CONFLICT });
    expect(authGateway.signUp).not.toHaveBeenCalled();
  });

  it('compensates nothing when Cognito rejects the sign up', async () => {
    const { sut, authGateway, accountRepository } = makeSut();
    authGateway.signUp.mockRejectedValue(new Error('cognito down'));

    await expect(sut.execute(input)).rejects.toThrow('cognito down');
    expect(authGateway.deleteUser).not.toHaveBeenCalled();
    expect(accountRepository.delete).not.toHaveBeenCalled();
  });

  it('deletes the Cognito user when persisting the account fails', async () => {
    const { sut, authGateway, accountRepository } = makeSut();
    const error = new Error('db down');
    accountRepository.create.mockRejectedValue(error);

    await expect(sut.execute(input)).rejects.toBe(error);
    expect(authGateway.deleteUser).toHaveBeenCalledWith({ externalId: 'sub-1' });
    expect(accountRepository.delete).not.toHaveBeenCalled();
  });

  it('undoes the account and the Cognito user, in reverse order, when the sign in fails', async () => {
    const { sut, authGateway, accountRepository, calls } = makeSut();
    const error = new Error('sign in failed');
    authGateway.signIn.mockRejectedValue(error);

    await expect(sut.execute(input)).rejects.toBe(error);
    expect(accountRepository.delete).toHaveBeenCalledWith(accountRepository.create.mock.calls[0]![0].id);
    expect(calls).toEqual(['deleteAccount', 'deleteUser']);
  });
});
