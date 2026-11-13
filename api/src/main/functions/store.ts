import 'reflect-metadata';

import { ListStoreCategoriesController } from '@application/controllers/store/ListStoreCategoriesController';
import { ListStoreProductsController } from '@application/controllers/store/ListStoreProductsController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter([
  { method: 'GET', path: '/store/categories', handler: ListStoreCategoriesController },
  { method: 'GET', path: '/store/products', handler: ListStoreProductsController },
]);
