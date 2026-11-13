import 'reflect-metadata';

import { ListStoreCategoriesController } from '@application/controllers/store/ListStoreCategoriesController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter([
  { method: 'GET', path: '/store/categories', handler: ListStoreCategoriesController },
]);
