import { Injectable } from '@kernel/decorators/Injectable';
import { Controller } from '@application/contracts/Controller';
import { GetDashboardUseCase } from '@application/useCases/dashboard/GetDashboardUseCase';

// Rota de admin: a permissão é exigida na lista de rotas (main/functions/dashboard.ts), não aqui.
@Injectable()
export class GetDashboardController extends Controller<'private', GetDashboardController.Response> {
  protected override readonly routeType = 'private';

  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {
    super();
  }

  protected override async handle(): Promise<Controller.Response<GetDashboardController.Response>> {
    const { accounts } = await this.getDashboardUseCase.execute();

    return {
      statusCode: 200,
      body: {
        accounts: { total: accounts.total },
      },
    };
  }
}

export namespace GetDashboardController {
  export type Response = {
    accounts: { total: number };
  };
}
