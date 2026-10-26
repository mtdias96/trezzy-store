import 'reflect-metadata';

import { GetDashboardController } from '@application/controllers/dashboard/GetDashboardController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter([
  { method: 'GET', path: '/admin/dashboard', handler: GetDashboardController, permission: 'dashboard:access' },
]);
