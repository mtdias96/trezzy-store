import 'reflect-metadata';

import { ListBrandsController } from '@application/controllers/brands/ListBrandsController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter([
  { method: 'GET', path: '/admin/brands', handler: ListBrandsController, permission: 'products:read' },
]);
