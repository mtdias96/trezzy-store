import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';
import { Controller } from '@application/contracts/Controller';
import { SignUpUseCase } from '@application/useCases/auth/SignUpUseCase';

import { type SignUpBody, signUpSchema } from './schemas/signUpSchema';

@Injectable()
@Schema(signUpSchema)
export class SignUpController extends Controller<'public', SignUpController.Response> {
  protected override readonly routeType = 'public';

  constructor(private readonly signUpUseCase: SignUpUseCase) {
    super();
  }

  protected override async handle({
    body,
  }: Controller.Request<'public', SignUpBody>): Promise<Controller.Response<SignUpController.Response>> {
    const { email, password } = body;

    const { accessToken, refreshToken, expiresIn } = await this.signUpUseCase.execute({ email, password });

    return {
      statusCode: 201,
      body: { accessToken, refreshToken, expiresIn },
    };
  }
}

export namespace SignUpController {
  export type Response = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
