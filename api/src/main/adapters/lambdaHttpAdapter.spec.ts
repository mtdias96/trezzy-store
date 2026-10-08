import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Controller } from '../../application/contracts/Controller.js';
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
      message: 'Validation failed',
      issues: [{ field: 'title', message: 'title is required' }],
    });
  });

  it('formats HttpError through errorHandler', async () => {
    class NotFoundController extends Controller<'public'> {
      protected async handle(): Promise<Controller.Response> {
        throw new HttpError(404, 'Resource not found', { resourceId: '123' });
      }
    }

    const handler = lambdaHttpAdapter(new NotFoundController());
    const res = await call(handler);

    expect(res.statusCode).toBe(404);
    expect(res.headers?.['Content-Type']).toBe('application/json');
    expect(JSON.parse(res.body!)).toEqual({
      message: 'Resource not found',
      details: { resourceId: '123' },
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
      message: 'Internal server error',
    });
  });
});
