import { Registry } from '@kernel/di/Registry.js';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpResponseSerializer from '@middy/http-response-serializer';
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { Controller, type IController } from '../../application/contracts/Controller.js';
import { ErrorCode } from '../../application/errors/ErrorCode.js';
import { HttpError } from '../../application/errors/HttpError.js';
import type { Constructor } from '../../shared/types/Constructor.js';
import { sanitizeObject } from '../utils/sanitizeObject.js';
import { errorHandler } from './middlewares/errorHandler.js';

export type RouteMap = Record<
  string,
  IController<unknown> | Constructor<IController<unknown>>
>;

export function lambdaHttpAdapter(
  target: IController<unknown> | Constructor<IController<unknown>> | RouteMap,
) {
  const isRouter =
    typeof target === 'object' && target !== null && !('execute' in target);

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

        const controllerOrClass = routeKey ? (target as RouteMap)[routeKey] : undefined;

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
        accountId: null,
      });
    })
    .use(errorHandler())
    .use(httpJsonBodyParser({ disableContentTypeError: true }));
}
