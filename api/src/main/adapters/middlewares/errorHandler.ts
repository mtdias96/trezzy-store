import type { MiddlewareObj } from '@middy/core';
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { HttpError } from '@application/errors/HttpError';
import { ValidationError } from '@application/errors/ValidationError';
import { httpStatusByErrorCode } from '@main/utils/httpStatusByErrorCode';
import { lambdaErrorResponse } from '@main/utils/lambdaErrorResponse';

export function errorHandler(): MiddlewareObj<
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
> {
  return {
    onError: (request) => {
      const { error } = request;

      if (!error) {
        return;
      }

      if (error instanceof ValidationError) {
        request.response = lambdaErrorResponse({
          statusCode: httpStatusByErrorCode[error.code],
          code: error.code,
          message: error.issues,
        });
        return;
      }

      if (error instanceof HttpError) {
        request.response = lambdaErrorResponse(error);
        return;
      }

      if (error instanceof ApplicationError) {
        request.response = lambdaErrorResponse({
          statusCode: error.statusCode ?? httpStatusByErrorCode[error.code],
          code: error.code,
          message: error.message,
        });
        return;
      }

      if (isExposedClientError(error)) {
        request.response = lambdaErrorResponse({
          statusCode: 400,
          code: ErrorCode.BAD_REQUEST,
          message: error.message,
        });
        return;
      }

      // eslint-disable-next-line no-console
      console.error(error);

      request.response = lambdaErrorResponse({
        statusCode: 500,
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal server error.',
      });
    },
  };
}

// Erros do Middy (ex: JSON inválido) marcam com expose: true os que podem ser mostrados ao cliente.
function isExposedClientError(error: Error): boolean {
  const { statusCode, expose } = error as Error & { statusCode?: unknown; expose?: unknown };

  return expose === true && typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500;
}
