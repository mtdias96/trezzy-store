import { Injectable } from '@kernel/decorators/Injectable';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { AccountRepository } from '@infra/database/repositories/AccountRepository';

@Injectable()
export class GetMeUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute({ accountId }: GetMeUseCase.Input): Promise<GetMeUseCase.Output> {
    const account = await this.accountRepository.findById(accountId);

    if (!account) {
      throw new ApplicationError(ErrorCode.NOT_FOUND, 'Account not found.');
    }

    return {
      id: account.id,
      email: account.email,
    };
  }
}

export namespace GetMeUseCase {
  export type Input = { accountId: string };
  export type Output = { id: string; email: string };
}
