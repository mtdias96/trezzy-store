import { Injectable } from '@kernel/decorators/Injectable';
import { Saga } from '@shared/saga/Saga';
import { Account } from '@application/entities/Account';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { AccountRepository } from '@infra/database/repositories/AccountRepository';
import { AuthGateway } from '@infra/gateways/AuthGateway';

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly authGateway: AuthGateway,
    private readonly accountRepository: AccountRepository,
    private readonly saga: Saga,
  ) { }

  async execute({ email, password }: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
    return this.saga.run(async ({ addCompensation }) => {
      const emailAlreadyInUse = await this.accountRepository.findByEmail(email);

      if (emailAlreadyInUse) {
        throw new ApplicationError(ErrorCode.CONFLICT, 'Email already in use.');
      }

      const account = new Account({ email });

      const { externalId } = await this.authGateway.signUp({
        email,
        password,
        internalId: account.id,
      });

      addCompensation(() => this.authGateway.deleteUser({ externalId }));

      account.externalId = externalId;

      await this.accountRepository.create(account);
      addCompensation(() => this.accountRepository.delete(account.id));

      const { accessToken, refreshToken, expiresIn } = await this.authGateway.signIn({ email, password });

      return { accessToken, refreshToken, expiresIn };
    });
  }
}

export namespace SignUpUseCase {
  export type Input = {
    email: string;
    password: string;
  };

  export type Output = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
