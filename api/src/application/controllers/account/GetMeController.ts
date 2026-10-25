import { Injectable } from '@kernel/decorators/Injectable';
import { Controller } from '@application/contracts/Controller';
import { GetMeUseCase } from '@application/useCases/account/GetMeUseCase';

@Injectable()
export class GetMeController extends Controller<'private', GetMeController.Response> {
  protected override readonly routeType = 'private';

  constructor(private readonly getMeUseCase: GetMeUseCase) {
    super();
  }

  protected override async handle({
    accountId,
  }: Controller.Request<'private'>): Promise<Controller.Response<GetMeController.Response>> {
    const account = await this.getMeUseCase.execute({ accountId });

    return { statusCode: 200, body: account };
  }
}

export namespace GetMeController {
  export type Response = GetMeUseCase.Output;
}
