import 'reflect-metadata';

import { GetMeController } from '@application/controllers/account/GetMeController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter([
  { method: 'GET', path: '/me', handler: GetMeController },
]);
