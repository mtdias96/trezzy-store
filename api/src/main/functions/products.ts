import 'reflect-metadata';

import { CreateProductController } from '@application/controllers/products/CreateProductController';
import { GetProductController } from '@application/controllers/products/GetProductController';
import { ListProductsController } from '@application/controllers/products/ListProductsController';
import { SetProductColorwayController } from '@application/controllers/products/SetProductColorwayController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter([
  { method: 'GET', path: '/admin/products', handler: ListProductsController, permission: 'products:read' },
  { method: 'GET', path: '/admin/products/{id}', handler: GetProductController, permission: 'products:read' },
  { method: 'POST', path: '/admin/products', handler: CreateProductController, permission: 'products:write' },
  { method: 'PUT', path: '/admin/products/{id}/colorway', handler: SetProductColorwayController, permission: 'products:write' },
]);
