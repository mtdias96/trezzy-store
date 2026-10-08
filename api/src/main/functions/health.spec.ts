import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { describe, expect, it } from 'vitest';
import { handler } from './health.js';

describe('Health Handler', () => {
  it('should return status 200 and healthy payload via DI and adapter', async () => {
    const fakeEvent = {} as APIGatewayProxyEventV2;
    const fakeContext = {} as Context;

    const response = await handler(fakeEvent, fakeContext);

    expect(response).toBeDefined();
    if (typeof response === 'object' && response !== null && 'statusCode' in response) {
      expect(response.statusCode).toBe(200);
      expect(response.headers?.['Content-Type']).toBe('application/json');

      const body = JSON.parse(response.body as string);
      expect(body.status).toBe('ok');
      expect(body.service).toBe('trezzy-api');
      expect(body.stage).toBe('dev');
      expect(body.region).toBe('sa-east-1');
      expect(body.timestamp).toBeDefined();
    }
  });
});

