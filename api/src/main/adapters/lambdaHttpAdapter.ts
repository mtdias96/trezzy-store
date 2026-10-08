import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpResponseSerializer from '@middy/http-response-serializer';
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { Controller, type IController } from '../../application/contracts/Controller.js';
import type { Constructor } from '../../shared/types/Constructor.js';
import { Registry } from '@kernel/di/Registry.js';
import { sanitizeObject } from '../utils/sanitizeObject.js';
import { errorHandler } from './middlewares/erroHandler.js';

export function lambdaHttpAdapter(
  controllerOrClass: IController<unknown> | Constructor<IController<unknown>>,
) {
  const controller =
    typeof controllerOrClass === 'function'
      ? Registry.getInstance().resolve(controllerOrClass)
      : controllerOrClass;

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
            serializer: ({ body }) => JSON.stringify(body),
          },
        ],
      }),
    )
    .handler(async (event) => {
      const requestContext = event.requestContext as
        | {
            authorizer?: {
              jwt?: { claims?: Record<string, unknown> };
              lambda?: Record<string, unknown>;
            };
          }
        | undefined;
      const accountId =
        (requestContext?.authorizer?.jwt?.claims?.sub as string | undefined) ??
        (requestContext?.authorizer?.lambda?.accountId as string | undefined);

      return controller.execute({
        body: event.body,
        headers: sanitizeObject(event.headers),
        params: sanitizeObject(event.pathParameters),
        queryParams: sanitizeObject(event.queryStringParameters),
        ...(accountId ? { accountId } : {}),
      });
    })
    .use(errorHandler())
    .use(httpJsonBodyParser({ disableContentTypeError: true }));
}
