import { describe, expect, it } from 'vitest';
import { Controller } from './Controller.js';
import { Injectable } from '@kernel/decorators/Injectable.js';
import { Schema } from '@kernel/decorators/Schema.js';
import { z } from 'zod';

const testSchema = z.object({
  name: z.string().min(1),
});

type TestBody = z.infer<typeof testSchema>;

@Injectable()
@Schema(testSchema)
class TestPublicController extends Controller<'public', { message: string }> {
  protected override async handle(
    request: Controller.Request<'public', TestBody>,
  ): Promise<Controller.Response<{ message: string }>> {
    return {
      statusCode: 200,
      body: { message: `Hello ${request.body.name}` },
    };
  }
}

@Injectable()
class TestPrivateController extends Controller<'private', { accountId: string }> {
  protected override async handle(
    request: Controller.Request<'private'>,
  ): Promise<Controller.Response<{ accountId: string }>> {
    return {
      statusCode: 200,
      body: { accountId: request.accountId },
    };
  }
}

describe('Controller base contract', () => {
  it('should handle public route with validated body', async () => {
    const controller = new TestPublicController();
    const response = await controller.execute({
      body: { name: 'Matheus' },
      headers: {},
      params: {},
      queryParams: {},
    });

    expect(response.statusCode).toBe(200);
    expect(response.body?.message).toBe('Hello Matheus');
  });

  it('should handle private route with accountId', async () => {
    const controller = new TestPrivateController();
    const response = await controller.execute({
      accountId: 'account-123',
      body: undefined,
      headers: {},
      params: {},
      queryParams: {},
    });

    expect(response.statusCode).toBe(200);
    expect(response.body?.accountId).toBe('account-123');
  });
});
