import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';
import { Controller } from '@application/contracts/Controller';
import { SignOutUseCase } from '@application/useCases/auth/SignOutUseCase';

import { type SignOutBody, signOutSchema } from './schemas/signOutSchema';

// Pública de propósito: quem tem o refresh token prova a posse da sessão, e um access token expirado não pode impedir o logout.
@Injectable()
@Schema(signOutSchema)
export class SignOutController extends Controller<'public'> {
  protected override readonly routeType = 'public';

  constructor(private readonly signOutUseCase: SignOutUseCase) {
    super();
  }

  protected override async handle({ body }: Controller.Request<'public', SignOutBody>): Promise<Controller.Response> {
    const { refreshToken } = body;

    await this.signOutUseCase.execute({ refreshToken });

    return { statusCode: 204 };
  }
}
