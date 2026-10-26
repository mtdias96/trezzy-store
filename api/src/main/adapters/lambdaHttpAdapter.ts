import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpResponseSerializer from '@middy/http-response-serializer';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

import { Registry } from '@kernel/di/Registry';
import type { Constructor } from '@shared/types/Constructor';
import type { Permission } from '@application/authorization/Permission';
import { ROLE_PERMISSIONS } from '@application/authorization/rolePermissions';
import { Controller, type IController } from '@application/contracts/Controller';
import { ErrorCode } from '@application/errors/ErrorCode';
import { HttpError } from '@application/errors/HttpError';
import { ADMIN_SCOPE, readScopes } from '@main/utils/authScopes';
import { sanitizeObject } from '@main/utils/sanitizeObject';

import { errorHandler } from './middlewares/errorHandler';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export type RouteDefinition = {
  method: HttpMethod;
  path: string;
  handler: IController<unknown> | Constructor<IController<unknown>>;
  // Sem ela, a rota segue só o routeType do controller. Com ela, quem não tem a permissão recebe 403.
  permission?: Permission;
};

export type RouteMap = Record<
  string,
  IController<unknown> | Constructor<IController<unknown>>
>;

export type AdapterTarget =
  | IController<unknown>
  | Constructor<IController<unknown>>
  | RouteDefinition[]
  | RouteMap;

export function lambdaHttpAdapter(target: AdapterTarget) {
  const routeMap = new Map<string, Pick<RouteDefinition, 'handler' | 'permission'>>();
  const isRouter =
    Array.isArray(target) ||
    (typeof target === 'object' && target !== null && !('execute' in target));

  if (Array.isArray(target)) {
    for (const route of target) {
      routeMap.set(`${route.method.toUpperCase()} ${route.path}`, { handler: route.handler, permission: route.permission });
    }
  } else if (isRouter) {
    for (const [key, handler] of Object.entries(target as RouteMap)) {
      routeMap.set(key, { handler });
    }
  }

  return middy<
    APIGatewayProxyEventV2,
    Controller.Response<unknown> | APIGatewayProxyStructuredResultV2
  >()
    .use(
      httpResponseSerializer({
        defaultContentType: 'application/json',
        serializers: [
          {
            regex: /^application\/json$/,
            serializer: ({ body }) => (body !== undefined ? JSON.stringify(body) : ''),
          },
        ],
      }),
    )
    .handler(async (event) => {
      let controller: IController<unknown>;
      let permission: Permission | undefined;

      if (isRouter) {
        const routeKey =
          event.routeKey ??
          (event.requestContext?.http
            ? `${event.requestContext.http.method} ${event.rawPath}`
            : undefined);

        const route = routeKey ? routeMap.get(routeKey) : undefined;

        if (!route) {
          throw new HttpError(
            404,
            ErrorCode.NOT_FOUND,
            `Route '${routeKey ?? 'UNKNOWN'}' not found.`,
          );
        }

        controller =
          typeof route.handler === 'function'
            ? Registry.getInstance().resolve(route.handler)
            : route.handler;
        permission = route.permission;
      } else {
        controller =
          typeof target === 'function'
            ? Registry.getInstance().resolve(target)
            : (target as IController<unknown>);
      }

      const accountId = getAccountId(event);
      const permissions = getPermissions(event);

      if (permission) {
        ensurePermission(permission, accountId, permissions);
      }

      return controller.execute({
        body: event.body,
        headers: sanitizeObject(event.headers),
        params: sanitizeObject(event.pathParameters),
        queryParams: sanitizeObject(event.queryStringParameters),
        accountId,
        permissions,
      });
    })
    .use(errorHandler())
    .use(httpJsonBodyParser({ disableContentTypeError: true }));
}

type JwtClaims = APIGatewayProxyEventV2WithJWTAuthorizer['requestContext']['authorizer']['jwt']['claims'];

// Rota sem authorizer não tem claims: é pública.
function getClaims(event: APIGatewayProxyEventV2 | APIGatewayProxyEventV2WithJWTAuthorizer): JwtClaims | null {
  if (!event.requestContext || !('authorizer' in event.requestContext)) {
    return null;
  }

  return event.requestContext.authorizer.jwt.claims;
}

// Só extrai a claim que liga o usuário ao nosso banco; quem exige que ela exista é o Controller privado.
function getAccountId(event: APIGatewayProxyEventV2 | APIGatewayProxyEventV2WithJWTAuthorizer): string | null {
  const internalId = getClaims(event)?.internalId;

  return typeof internalId === 'string' && internalId.length > 0 ? internalId : null;
}

// O scope de admin vem do grupo do Cognito (PreTokenGeneration). MVP: admin tem todas as permissões.
// Quando existirem cargos, as permissões do admin passam a vir do banco; customer nunca paga essa consulta.
function getPermissions(event: APIGatewayProxyEventV2 | APIGatewayProxyEventV2WithJWTAuthorizer): readonly Permission[] {
  const claims = getClaims(event);

  if (!claims) {
    return [];
  }

  return readScopes(claims.scope).includes(ADMIN_SCOPE) ? ROLE_PERMISSIONS.admin : ROLE_PERMISSIONS.customer;
}

// Defesa além do authorizer: uma rota de admin publicada sem `scopes` no serverless.yml continua fechada.
function ensurePermission(permission: Permission, accountId: string | null, permissions: readonly Permission[]): void {
  if (!accountId) {
    throw new HttpError(401, ErrorCode.UNAUTHORIZED, 'Token has no account identity.');
  }

  if (!permissions.includes(permission)) {
    throw new HttpError(403, ErrorCode.FORBIDDEN, `Missing permission '${permission}'.`);
  }
}
