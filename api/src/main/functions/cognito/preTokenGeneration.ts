import type { PreTokenGenerationV2TriggerEvent } from 'aws-lambda';

import { ADMIN_SCOPE } from '@main/utils/authScopes';

// Injeta nosso id interno e o scope de admin no access token: o JWT authorizer valida o scope e o adapter lê as claims.
export async function handler(event: PreTokenGenerationV2TriggerEvent) {
  const internalId = event.request.userAttributes['custom:internalId'];
  const isAdmin = event.request.groupConfiguration?.groupsToOverride?.includes('admin') ?? false;

  // Usuário criado fora da API (sem o atributo): o token sai sem a claim e as rotas privadas respondem 401.
  if (!internalId && !isAdmin) {
    return event;
  }

  event.response = {
    claimsAndScopeOverrideDetails: {
      accessTokenGeneration: {
        claimsToAddOrOverride: internalId ? { internalId } : undefined,
        scopesToAdd: isAdmin ? [ADMIN_SCOPE] : undefined,
      },
    },
  };

  return event;
}
