import type { PreTokenGenerationV2TriggerEvent } from 'aws-lambda';

export async function handler(event: PreTokenGenerationV2TriggerEvent) {
  const internalId = event.request.userAttributes['custom:internalId'];

  if (!internalId) {
    return event;
  }

  event.response = {
    claimsAndScopeOverrideDetails: {
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          internalId,
        },
      },
    },
  };

  return event;
}
