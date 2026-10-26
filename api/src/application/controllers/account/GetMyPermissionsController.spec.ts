import { describe, expect, it } from 'vitest';

import { GetMyPermissionsController } from './GetMyPermissionsController';

const request = { body: undefined, params: {}, queryParams: {}, accountId: 'user-1' };

describe('GetMyPermissionsController', () => {
  it('returns the permissions resolved for the token', async () => {
    const response = await new GetMyPermissionsController().execute({ ...request, permissions: ['dashboard:access'] });

    expect(response).toEqual({ statusCode: 200, body: { permissions: ['dashboard:access'] } });
  });

  it('returns an empty list for customers', async () => {
    const response = await new GetMyPermissionsController().execute(request);

    expect(response).toEqual({ statusCode: 200, body: { permissions: [] } });
  });
});
