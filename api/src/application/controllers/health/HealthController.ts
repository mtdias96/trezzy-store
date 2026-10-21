import { Injectable } from '@kernel/decorators/Injectable';
import { Controller } from '@application/contracts/Controller';
import { HealthUseCase } from '@application/useCases/health/HealthUseCase';

@Injectable()
export class HealthController extends Controller<'public', HealthController.Response> {
  constructor(private readonly healthUseCase: HealthUseCase) {
    super();
  }

  protected override async handle(): Promise<Controller.Response<HealthController.Response>> {
    const health = this.healthUseCase.execute();

    return {
      statusCode: 200,
      body: health,
    };
  }
}

export namespace HealthController {
  export type Response = {
    status: string;
    service: string;
    stage: string;
    region: string;
    timestamp: string;
  };
}
