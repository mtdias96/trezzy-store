import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';
import { Controller } from '@application/contracts/Controller';
import { SignInUseCase } from '@application/useCases/auth/SignInUseCase';

import { type SignInBody, signInSchema } from './schemas/signInSchema';

@Injectable()
@Schema(signInSchema)
export class SignInController extends Controller<'public', SignInController.Response> {
  protected override readonly routeType = 'public';

  constructor(private readonly signInUseCase: SignInUseCase) {
    super();
  }

  protected override async handle({
    body,
  }: Controller.Request<'public', SignInBody>): Promise<Controller.Response<SignInController.Response>> {
    const { email, password } = body;

    const { accessToken, refreshToken, expiresIn } = await this.signInUseCase.execute({ email, password });

    return {
      statusCode: 200,
      body: { accessToken, refreshToken, expiresIn },
    };
  }
}

export namespace SignInController {
  export type Response = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
