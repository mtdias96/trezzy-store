import 'reflect-metadata';

import { ListCategoriesController } from '@application/controllers/categories/ListCategoriesController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter([
  { method: 'GET', path: '/admin/categories', handler: ListCategoriesController, permission: 'products:read' },
]);
