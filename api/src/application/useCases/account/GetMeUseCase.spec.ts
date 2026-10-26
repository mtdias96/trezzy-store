import { describe, expect, it, vi } from 'vitest';

import { Account } from '@application/entities/Account';
import { ErrorCode } from '@application/errors/ErrorCode';
import type { AccountRepository } from '@infra/database/repositories/AccountRepository';

import { GetMeUseCase } from './GetMeUseCase';

function makeSut(account: Account | null) {
  const accountRepository = { findById: vi.fn<AccountRepository['findById']>().mockResolvedValue(account) };
  const sut = new GetMeUseCase(accountRepository as unknown as AccountRepository);

  return { sut, accountRepository };
}

describe('GetMeUseCase', () => {
  it('returns the account without internal fields', async () => {
    const { sut, accountRepository } = makeSut(new Account({ id: 'acc-1', email: 'a@b.com', externalId: 'sub-1' }));

    await expect(sut.execute({ accountId: 'acc-1' })).resolves.toEqual({ id: 'acc-1', email: 'a@b.com' });
    expect(accountRepository.findById).toHaveBeenCalledWith('acc-1');
  });

  it('throws NOT_FOUND when the account does not exist', async () => {
    const { sut } = makeSut(null);

    await expect(sut.execute({ accountId: 'missing' })).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
