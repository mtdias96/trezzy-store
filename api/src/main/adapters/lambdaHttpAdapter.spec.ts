import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { Controller } from '../../application/contracts/Controller.js';
import { ApplicationError } from '../../application/errors/ApplicationError.js';
import { ErrorCode } from '../../application/errors/ErrorCode.js';
import { HttpError } from '../../application/errors/HttpError.js';
import { Schema } from '../../kernel/decorators/Schema.js';

import { lambdaHttpAdapter } from './lambdaHttpAdapter.js';

const context = {} as Context;
const call = (handler: ReturnType<typeof lambdaHttpAdapter>, event: Partial<APIGatewayProxyEventV2> = {}) =>
  handler(event as APIGatewayProxyEventV2, context) as Promise<{
    statusCode: number;
    headers?: Record<string, string>;
    body?: string;
  }>;

describe('lambdaHttpAdapter', () => {
  it('parses JSON body, sanitizes params and headers, and serializes response', async () => {
    let capturedRequest: Controller.Request<'public', { name: string }> | undefined;

    class CreateProductController extends Controller<'public', { id: string }> {
      protected async handle(
        request: Controller.Request<'public', { name: string }>,
      ): Promise<Controller.Response<{ id: string }>> {
        capturedRequest = request;
        return {
          statusCode: 201,
          body: { id: '123' },
        };
      }
    }

    const handler = lambdaHttpAdapter(new CreateProductController());
    const res = await call(handler, {
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer token',
      },
      body: JSON.stringify({ name: 'Produto teste' }),
      pathParameters: {
        id: '123',
      },
      queryStringParameters: {
        page: '1',
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.headers?.['Content-Type']).toBe('application/json');
    expect(JSON.parse(res.body!)).toEqual({ id: '123' });
    expect(capturedRequest?.params).toEqual({ id: '123' });
    expect(capturedRequest?.queryParams).toEqual({ page: '1' });
    expect(capturedRequest?.headers?.authorization).toBe('Bearer token');
  });

  it('handles requests without body cleanly and resolves from class directly', async () => {
    class SimpleController extends Controller<'public', { ok: boolean }> {
      protected async handle(): Promise<Controller.Response<{ ok: boolean }>> {
        return {
          statusCode: 200,
          body: { ok: true },
        };
      }
    }

    const handler = lambdaHttpAdapter(SimpleController);
    const res = await call(handler);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body!)).toEqual({ ok: true });
  });

  it('validates request body using @Schema decorator and formats issues', async () => {
    const ProductSchema = z.object({
      title: z.string({ message: 'title is required' }).min(1, { message: 'title is required' }).transform((v) => v.toUpperCase()),
    });

    @Schema(ProductSchema)
    class ValidatedController extends Controller<'public', { title: string }> {
      protected async handle(
        request: Controller.Request<'public', { title: string }>,
      ): Promise<Controller.Response<{ title: string }>> {
        return {
          statusCode: 200,
          body: { title: request.body.title },
        };
      }
    }

    const handler = lambdaHttpAdapter(new ValidatedController());

    // Valid payload
    const successRes = await call(handler, {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'camisa' }),
    });
    expect(successRes.statusCode).toBe(200);
    expect(JSON.parse(successRes.body!)).toEqual({ title: 'CAMISA' });

    // Invalid payload
    const failRes = await call(handler, {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(failRes.statusCode).toBe(400);
    expect(JSON.parse(failRes.body!)).toEqual({
      error: {
        code: ErrorCode.VALIDATION,
        message: [{ field: 'title', error: 'title is required' }],
      },
    });
  });

  it('formats HttpError through errorHandler', async () => {
    class NotFoundController extends Controller<'public'> {
      protected async handle(): Promise<Controller.Response> {
        throw new HttpError(404, ErrorCode.NOT_FOUND, 'Resource not found');
      }
    }

    const handler = lambdaHttpAdapter(new NotFoundController());
    const res = await call(handler);

    expect(res.statusCode).toBe(404);
    expect(res.headers?.['Content-Type']).toBe('application/json');
    expect(JSON.parse(res.body!)).toEqual({
      error: {
        code: ErrorCode.NOT_FOUND,
        message: 'Resource not found',
      },
    });
  });

  it('formats ApplicationError through errorHandler', async () => {
    class BusinessRuleController extends Controller<'public'> {
      protected async handle(): Promise<Controller.Response> {
        throw new ApplicationError(ErrorCode.BAD_REQUEST, 'Email already in use', 409);
      }
    }

    const handler = lambdaHttpAdapter(new BusinessRuleController());
    const res = await call(handler);

    expect(res.statusCode).toBe(409);
    expect(res.headers?.['Content-Type']).toBe('application/json');
    expect(JSON.parse(res.body!)).toEqual({
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: 'Email already in use',
      },
    });
  });

  it('catches generic errors and returns 500 with standard message', async () => {
    class ErrorController extends Controller<'public'> {
      protected async handle(): Promise<Controller.Response> {
        throw new Error('Database connection failed');
      }
    }

    const handler = lambdaHttpAdapter(new ErrorController());
    const res = await call(handler);

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body!)).toEqual({
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal server error.',
      },
    });
  });

  it('dispatches to correct controller when using RouteMap and returns 404 for unknown route', async () => {
    class ListController extends Controller<'public', { items: string[] }> {
      protected async handle(): Promise<Controller.Response<{ items: string[] }>> {
        return { statusCode: 200, body: { items: ['item1'] } };
      }
    }

    class CreateController extends Controller<'public', { id: string }> {
      protected async handle(): Promise<Controller.Response<{ id: string }>> {
        return { statusCode: 201, body: { id: 'created-1' } };
      }
    }

    const routerHandler = lambdaHttpAdapter({
      'GET /products': ListController,
      'POST /products': CreateController,
    });

    // Test GET /products
    const getRes = await call(routerHandler, {
      routeKey: 'GET /products',
    });
    expect(getRes.statusCode).toBe(200);
    expect(JSON.parse(getRes.body!)).toEqual({ items: ['item1'] });

    // Test POST /products
    const postRes = await call(routerHandler, {
      routeKey: 'POST /products',
    });
    expect(postRes.statusCode).toBe(201);
    expect(JSON.parse(postRes.body!)).toEqual({ id: 'created-1' });

    // Test unknown route
    const notFoundRes = await call(routerHandler, {
      routeKey: 'DELETE /products/1',
    });
    expect(notFoundRes.statusCode).toBe(404);
    expect(JSON.parse(notFoundRes.body!)).toEqual({
      error: {
        code: ErrorCode.NOT_FOUND,
        message: 'Route \'DELETE /products/1\' not found.',
      },
    });
  });

  it('dispatches to correct controller when using RouteDefinition array shape', async () => {
    class ListUsersController extends Controller<'public', { users: string[] }> {
      protected async handle(): Promise<Controller.Response<{ users: string[] }>> {
        return { statusCode: 200, body: { users: ['user1', 'user2'] } };
      }
    }

    class UpdateUserController extends Controller<'public', { updated: boolean }> {
      protected async handle(): Promise<Controller.Response<{ updated: boolean }>> {
        return { statusCode: 200, body: { updated: true } };
      }
    }

    const handler = lambdaHttpAdapter([
      {
        path: '/users',
        method: 'GET',
        handler: ListUsersController,
      },
      {
        path: '/users/{userId}',
        method: 'PUT',
        handler: UpdateUserController,
      },
    ]);

    // Test GET /users
    const getRes = await call(handler, {
      routeKey: 'GET /users',
    });
    expect(getRes.statusCode).toBe(200);
    expect(JSON.parse(getRes.body!)).toEqual({ users: ['user1', 'user2'] });

    // Test PUT /users/{userId}
    const putRes = await call(handler, {
      routeKey: 'PUT /users/{userId}',
    });
    expect(putRes.statusCode).toBe(200);
    expect(JSON.parse(putRes.body!)).toEqual({ updated: true });
  });
});
