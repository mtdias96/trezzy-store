import type { MiddlewareObj } from '@middy/core';
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { ZodError } from 'zod';
import { ApplicationError } from '../../../application/errors/ApplicationError.js';
import { ErrorCode } from '../../../application/errors/ErrorCode.js';
import { HttpError } from '../../../application/errors/HttpError.js';

function createErrorResponse(
  statusCode: number,
  body: Record<string, unknown>,
): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

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

      // 1. Erro de Validação de Schema (Zod)
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          error: issue.message,
          message: issue.message,
        }));

        request.response = createErrorResponse(400, {
          code: ErrorCode.VALIDATION,
          message: 'Validation failed',
          issues,
        });
        return;
      }

      // 2. Erro HTTP Operacional (HttpError)
      if (error instanceof HttpError) {
        const defaultCode =
          error.statusCode === 404
            ? ErrorCode.NOT_FOUND
            : error.statusCode === 409
              ? ErrorCode.CONFLICT
              : error.statusCode === 401
                ? ErrorCode.UNAUTHORIZED
                : error.statusCode === 403
                  ? ErrorCode.FORBIDDEN
                  : ErrorCode.BAD_REQUEST;

        request.response = createErrorResponse(error.statusCode, {
          code: error.code ?? defaultCode,
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        });
        return;
      }

      // 3. Erro de Aplicação / Domínio (ApplicationError)
      if (error instanceof ApplicationError) {
        request.response = createErrorResponse(error.statusCode, {
          code: error.code,
          message: error.message,
        });
        return;
      }

      // 4. Erro Inesperado (500)
      // eslint-disable-next-line no-console
      console.error(error);

      request.response = createErrorResponse(500, {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal server error.',
      });
    },
  };
}
