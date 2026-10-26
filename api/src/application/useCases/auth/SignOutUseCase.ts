import { Injectable } from '@kernel/decorators/Injectable';
import { AuthGateway } from '@infra/gateways/AuthGateway';

@Injectable()
export class SignOutUseCase {
  constructor(private readonly authGateway: AuthGateway) {}

  async execute({ refreshToken }: SignOutUseCase.Input): Promise<void> {
    await this.authGateway.signOut({ refreshToken });
  }
}

export namespace SignOutUseCase {
  export type Input = { refreshToken: string };
}
