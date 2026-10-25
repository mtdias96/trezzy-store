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
import { Controller, type IController } from '@application/contracts/Controller';
import { ErrorCode } from '@application/errors/ErrorCode';
import { HttpError } from '@application/errors/HttpError';
import { sanitizeObject } from '@main/utils/sanitizeObject';

import { errorHandler } from './middlewares/errorHandler';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export type RouteDefinition = {
  method: HttpMethod;
  path: string;
  handler: IController<unknown> | Constructor<IController<unknown>>;
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
  const routeMap = new Map<string, IController<unknown> | Constructor<IController<unknown>>>();
  const isRouter =
    Array.isArray(target) ||
    (typeof target === 'object' && target !== null && !('execute' in target));

  if (Array.isArray(target)) {
    for (const route of target) {
      routeMap.set(`${route.method.toUpperCase()} ${route.path}`, route.handler);
    }
  } else if (isRouter) {
    for (const [key, handler] of Object.entries(target as RouteMap)) {
      routeMap.set(key, handler);
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

      if (isRouter) {
        const routeKey =
          event.routeKey ??
          (event.requestContext?.http
            ? `${event.requestContext.http.method} ${event.rawPath}`
            : undefined);

        const controllerOrClass = routeKey ? routeMap.get(routeKey) : undefined;

        if (!controllerOrClass) {
          throw new HttpError(
            404,
            ErrorCode.NOT_FOUND,
            `Route '${routeKey ?? 'UNKNOWN'}' not found.`,
          );
        }

        controller =
          typeof controllerOrClass === 'function'
            ? Registry.getInstance().resolve(controllerOrClass)
            : controllerOrClass;
      } else {
        controller =
          typeof target === 'function'
            ? Registry.getInstance().resolve(target)
            : (target as IController<unknown>);
      }

      return controller.execute({
        body: event.body,
        headers: sanitizeObject(event.headers),
        params: sanitizeObject(event.pathParameters),
        queryParams: sanitizeObject(event.queryStringParameters),
        accountId: getAccountId(event),
      });
    })
    .use(errorHandler())
    .use(httpJsonBodyParser({ disableContentTypeError: true }));
}

// Só extrai a claim que liga o usuário ao nosso banco; quem exige que ela exista é o Controller privado.
function getAccountId(event: APIGatewayProxyEventV2 | APIGatewayProxyEventV2WithJWTAuthorizer): string | null {
  if (!event.requestContext || !('authorizer' in event.requestContext)) {
    return null;
  }

  const { internalId } = event.requestContext.authorizer.jwt.claims;

  return typeof internalId === 'string' && internalId.length > 0 ? internalId : null;
}
