import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class HealthUseCase {
  execute(): HealthUseCase.Output {
    return {
      status: 'ok',
      service: process.env.SERVICE_NAME ?? 'trezzy-api',
      stage: process.env.STAGE ?? 'dev',
      region: process.env.REGION ?? 'sa-east-1',
      timestamp: new Date().toISOString(),
    };
  }
}

export namespace HealthUseCase {
  export type Output = {
    status: string;
    service: string;
    stage: string;
    region: string;
    timestamp: string;
  };
}

