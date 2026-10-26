import { Injectable } from '@kernel/decorators/Injectable';
import { AccountRepository } from '@infra/database/repositories/AccountRepository';

@Injectable()
export class GetDashboardUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(): Promise<GetDashboardUseCase.Output> {
    const total = await this.accountRepository.count();

    return { accounts: { total } };
  }
}

export namespace GetDashboardUseCase {
  export type Output = {
    accounts: { total: number };
  };
}
