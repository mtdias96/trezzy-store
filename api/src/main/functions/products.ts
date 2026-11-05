import 'reflect-metadata';

import { CreateProductController } from '@application/controllers/products/CreateProductController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter([
  { method: 'POST', path: '/admin/products', handler: CreateProductController, permission: 'products:write' },
]);
