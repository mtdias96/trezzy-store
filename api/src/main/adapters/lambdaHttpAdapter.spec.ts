import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { describe, expect, it, vi } from 'vitest';
import * as z from 'zod';

import { Schema } from '@kernel/decorators/Schema';
import { Controller } from '@application/contracts/Controller';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { HttpError } from '@application/errors/HttpError';
import { ADMIN_SCOPE } from '@main/utils/authScopes';

import { lambdaHttpAdapter } from './lambdaHttpAdapter';

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

      protected override readonly routeType = 'public';

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
      protected override readonly routeType = 'public';

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
      protected override readonly routeType = 'public';

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

    const successRes = await call(handler, {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'camisa' }),
    });
    expect(successRes.statusCode).toBe(200);
    expect(JSON.parse(successRes.body!)).toEqual({ title: 'CAMISA' });

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
      protected override readonly routeType = 'public';

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
      protected override readonly routeType = 'public';

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
      protected override readonly routeType = 'public';

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

  it('responds 400 BAD_REQUEST when the JSON body is malformed or missing', async () => {
    class EchoController extends Controller<'public', unknown> {
      protected override readonly routeType = 'public';

      protected async handle(request: Controller.Request<'public'>): Promise<Controller.Response<unknown>> {
        return { statusCode: 200, body: request.body };
      }
    }

    const handler = lambdaHttpAdapter(new EchoController());
    const malformed = await call(handler, {
      headers: { 'content-type': 'application/json' },
      body: '{"name": "abc",,}',
    });
    const missing = await call(handler, { headers: { 'content-type': 'application/json' } });

    for (const res of [malformed, missing]) {
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body!)).toEqual({
        error: { code: ErrorCode.BAD_REQUEST, message: 'Invalid or malformed JSON was provided' },
      });
    }
  });

  it('treats a ZodError outside request validation as an internal error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    class GatewayController extends Controller<'public'> {

      protected override readonly routeType = 'public';

      protected async handle(): Promise<Controller.Response> {
        z.object({ status: z.string() }).parse({ status: 42 });
        return { statusCode: 200 };
      }
    }

    const res = await call(lambdaHttpAdapter(new GatewayController()));

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body!)).toEqual({
      error: { code: ErrorCode.INTERNAL_SERVER_ERROR, message: 'Internal server error.' },
    });
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });

  it('derives the HTTP status from the ErrorCode when ApplicationError has no explicit status', async () => {
    class MissingProductController extends Controller<'public'> {
      protected override readonly routeType = 'public';

      protected async handle(): Promise<Controller.Response> {
        throw new ApplicationError(ErrorCode.NOT_FOUND, 'Product not found.');
      }
    }

    const res = await call(lambdaHttpAdapter(new MissingProductController()));

    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body!)).toEqual({
      error: { code: ErrorCode.NOT_FOUND, message: 'Product not found.' },
    });
  });

  it('validates params with Controller.validate and responds 400 VALIDATION', async () => {
    const paramsSchema = z.object({ id: z.uuid() });

    class GetByIdController extends Controller<'public', { id: string }> {

      protected override readonly routeType = 'public';

      protected async handle({ params }: Controller.Request<'public'>): Promise<Controller.Response<{ id: string }>> {
        const { id } = this.validate(paramsSchema, params);

        return { statusCode: 200, body: { id } };
      }
    }

    const handler = lambdaHttpAdapter(new GetByIdController());
    const valid = await call(handler, { pathParameters: { id: '0d8f7a8e-6c1b-4a5e-9a37-2f1c3b4d5e6f' } });
    const invalid = await call(handler, { pathParameters: { id: 'not-a-uuid' } });

    expect(valid.statusCode).toBe(200);
    expect(invalid.statusCode).toBe(400);
    expect(JSON.parse(invalid.body!)).toMatchObject({
      error: { code: ErrorCode.VALIDATION, message: [{ field: 'id' }] },
    });
  });

  it('dispatches to correct controller when using RouteMap and returns 404 for unknown route', async () => {
    class ListController extends Controller<'public', { items: string[] }> {
      protected override readonly routeType = 'public';

      protected async handle(): Promise<Controller.Response<{ items: string[] }>> {
        return { statusCode: 200, body: { items: ['item1'] } };
      }
    }

    class CreateController extends Controller<'public', { id: string }> {

      protected override readonly routeType = 'public';

      protected async handle(): Promise<Controller.Response<{ id: string }>> {
        return { statusCode: 201, body: { id: 'created-1' } };
      }
    }

    const routerHandler = lambdaHttpAdapter({
      'GET /products': ListController,
      'POST /products': CreateController,
    });

    const getRes = await call(routerHandler, {
      routeKey: 'GET /products',
    });
    expect(getRes.statusCode).toBe(200);
    expect(JSON.parse(getRes.body!)).toEqual({ items: ['item1'] });

    const postRes = await call(routerHandler, {
      routeKey: 'POST /products',
    });
    expect(postRes.statusCode).toBe(201);
    expect(JSON.parse(postRes.body!)).toEqual({ id: 'created-1' });

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
      protected override readonly routeType = 'public';

      protected async handle(): Promise<Controller.Response<{ users: string[] }>> {
        return { statusCode: 200, body: { users: ['user1', 'user2'] } };
      }
    }

    class UpdateUserController extends Controller<'public', { updated: boolean }> {

      protected override readonly routeType = 'public';

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

    const getRes = await call(handler, {
      routeKey: 'GET /users',
    });
    expect(getRes.statusCode).toBe(200);
    expect(JSON.parse(getRes.body!)).toEqual({ users: ['user1', 'user2'] });

    const putRes = await call(handler, {
      routeKey: 'PUT /users/{userId}',
    });
    expect(putRes.statusCode).toBe(200);
    expect(JSON.parse(putRes.body!)).toEqual({ updated: true });
  });

  describe('accountId', () => {
    class WhoAmIController extends Controller<'private', { accountId: string | null }> {
      protected override readonly routeType = 'private';

      protected async handle({ accountId }: Controller.Request<'private'>): Promise<Controller.Response<{ accountId: string | null }>> {
        return { statusCode: 200, body: { accountId } };
      }
    }

    const withClaims = (claims: Record<string, string>) =>
      ({ authorizer: { jwt: { claims, scopes: null } } }) as unknown as APIGatewayProxyEventV2['requestContext'];

    it('maps the internalId claim from the JWT authorizer to accountId', async () => {
      const res = await call(lambdaHttpAdapter(new WhoAmIController()), {
        requestContext: withClaims({ sub: 'cognito-sub', internalId: 'user-1' }),
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body!)).toEqual({ accountId: 'user-1' });
    });

    it('responds 401 when the token has no internalId claim', async () => {
      const res = await call(lambdaHttpAdapter(new WhoAmIController()), {
        requestContext: withClaims({ sub: 'cognito-sub' }),
      });

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!)).toEqual({
        error: { code: ErrorCode.UNAUTHORIZED, message: 'Token has no account identity.' },
      });
    });

    it('responds 401 when a private controller is served by a route without authorizer', async () => {
      const res = await call(lambdaHttpAdapter(new WhoAmIController()), {
        requestContext: { http: { method: 'GET' } } as APIGatewayProxyEventV2['requestContext'],
      });

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body!)).toEqual({
        error: { code: ErrorCode.UNAUTHORIZED, message: 'Token has no account identity.' },
      });
    });

    it('sends accountId null to public controllers on routes without authorizer', async () => {
      class PublicWhoAmIController extends Controller<'public', { accountId: null }> {
        protected override readonly routeType = 'public';

        protected async handle({ accountId }: Controller.Request<'public'>): Promise<Controller.Response<{ accountId: null }>> {
          return { statusCode: 200, body: { accountId } };
        }
      }

      const res = await call(lambdaHttpAdapter(new PublicWhoAmIController()), {
        requestContext: { http: { method: 'GET' } } as APIGatewayProxyEventV2['requestContext'],
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body!)).toEqual({ accountId: null });
    });
  });

  describe('permissions', () => {
    class PermissionsController extends Controller<'private', { permissions: readonly string[] }> {
      protected override readonly routeType = 'private';

      protected async handle({ permissions }: Controller.Request<'private'>): Promise<Controller.Response<{ permissions: readonly string[] }>> {
        return { statusCode: 200, body: { permissions } };
      }
    }

    const tokenWith = (scope: string) =>
      ({
        authorizer: { jwt: { claims: { sub: 'cognito-sub', internalId: 'user-1', scope }, scopes: null } },
      }) as unknown as APIGatewayProxyEventV2['requestContext'];

    const customerToken = tokenWith('aws.cognito.signin.user.admin');
    const adminToken = tokenWith(`aws.cognito.signin.user.admin ${ADMIN_SCOPE}`);

    const adminRoute = lambdaHttpAdapter([
      { method: 'GET', path: '/admin/dashboard', handler: new PermissionsController(), permission: 'dashboard:access' },
    ]);

    it('lets an admin token through a route that requires a permission', async () => {
      const res = await call(adminRoute, { routeKey: 'GET /admin/dashboard', requestContext: adminToken });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body!)).toEqual({ permissions: ['dashboard:access'] });
    });

    it('responds 403 to a customer token on a route that requires a permission', async () => {
      const res = await call(adminRoute, { routeKey: 'GET /admin/dashboard', requestContext: customerToken });

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body!)).toEqual({
        error: { code: ErrorCode.FORBIDDEN, message: "Missing permission 'dashboard:access'." },
      });
    });

    it('does not mistake the default cognito scope for the admin scope', async () => {
      const res = await call(adminRoute, {
        routeKey: 'GET /admin/dashboard',
        requestContext: tokenWith('aws.cognito.signin.user.admin trezzy/admin-like'),
      });

      expect(res.statusCode).toBe(403);
    });

    it('responds 401 before checking permissions when the route has no authorizer', async () => {
      const res = await call(adminRoute, {
        routeKey: 'GET /admin/dashboard',
        requestContext: { http: { method: 'GET' } } as APIGatewayProxyEventV2['requestContext'],
      });

      expect(res.statusCode).toBe(401);
    });

    it('passes an empty permission list to customers on routes without a permission', async () => {
      const customerRoute = lambdaHttpAdapter([{ method: 'GET', path: '/me', handler: new PermissionsController() }]);

      const res = await call(customerRoute, { routeKey: 'GET /me', requestContext: customerToken });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body!)).toEqual({ permissions: [] });
    });
  });
});
