import 'reflect-metadata';

import { GetMeController } from '@application/controllers/account/GetMeController';
import { GetMyPermissionsController } from '@application/controllers/account/GetMyPermissionsController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter([
  { method: 'GET', path: '/me', handler: GetMeController },
  { method: 'GET', path: '/me/permissions', handler: GetMyPermissionsController },
]);
