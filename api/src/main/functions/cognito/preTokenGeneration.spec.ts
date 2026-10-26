import type { PreTokenGenerationV2TriggerEvent } from 'aws-lambda';
import { describe, expect, it } from 'vitest';

import { ADMIN_SCOPE } from '@main/utils/authScopes';

import { handler } from './preTokenGeneration';

const makeEvent = (userAttributes: Record<string, string>, groups: string[] = []) =>
  ({
    request: { userAttributes, groupConfiguration: { groupsToOverride: groups } },
    response: {},
  }) as unknown as PreTokenGenerationV2TriggerEvent;

describe('preTokenGeneration trigger', () => {
  it('adds the internalId claim to the access token', async () => {
    const result = await handler(makeEvent({ sub: 'sub-1', 'custom:internalId': 'user-1' }));

    expect(result.response.claimsAndScopeOverrideDetails?.accessTokenGeneration).toStrictEqual({
      claimsToAddOrOverride: { internalId: 'user-1' },
      scopesToAdd: undefined,
    });
  });

  it('adds the admin scope when the user is in the admin group', async () => {
    const result = await handler(makeEvent({ sub: 'sub-1', 'custom:internalId': 'user-1' }, ['admin']));

    expect(result.response.claimsAndScopeOverrideDetails?.accessTokenGeneration).toStrictEqual({
      claimsToAddOrOverride: { internalId: 'user-1' },
      scopesToAdd: [ADMIN_SCOPE],
    });
  });

  it('ignores groups other than admin', async () => {
    const result = await handler(makeEvent({ sub: 'sub-1', 'custom:internalId': 'user-1' }, ['beta-testers']));

    expect(result.response.claimsAndScopeOverrideDetails?.accessTokenGeneration?.scopesToAdd).toBeUndefined();
  });

  it('leaves the token untouched when the user has no internalId and no admin group', async () => {
    const result = await handler(makeEvent({ sub: 'sub-1' }));

    expect(result.response).toEqual({});
  });
});
