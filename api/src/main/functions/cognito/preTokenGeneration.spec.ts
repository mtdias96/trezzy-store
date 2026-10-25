import type { PreTokenGenerationV2TriggerEvent } from 'aws-lambda';
import { describe, expect, it } from 'vitest';

import { handler } from './preTokenGeneration';

const makeEvent = (userAttributes: Record<string, string>) =>
  ({ request: { userAttributes }, response: {} }) as unknown as PreTokenGenerationV2TriggerEvent;

describe('preTokenGeneration trigger', () => {
  it('adds the internalId claim to the access token', async () => {
    const result = await handler(makeEvent({ sub: 'sub-1', 'custom:internalId': 'user-1' }));

    expect(result.response).toEqual({
      claimsAndScopeOverrideDetails: {
        accessTokenGeneration: {
          claimsToAddOrOverride: { internalId: 'user-1' },
        },
      },
    });
  });

  it('leaves the token untouched when the user has no internalId yet', async () => {
    const result = await handler(makeEvent({ sub: 'sub-1' }));

    expect(result.response).toEqual({});
  });
});
