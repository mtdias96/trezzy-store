import type { MiddlewareObj } from '@middy/core';
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { ZodError } from 'zod';

import { ApplicationError } from '../../../application/errors/ApplicationError.js';
import { ErrorCode } from '../../../application/errors/ErrorCode.js';
import { HttpError } from '../../../application/errors/HttpError.js';
import { lambdaErrorResponse } from '../../utils/lambdaErrorResponse.js';

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
        request.response = lambdaErrorResponse({
          statusCode: 400,
          code: ErrorCode.VALIDATION,
          message: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            error: issue.message,
          })),
        });
        return;
      }

      // 2. Erro HTTP Operacional (HttpError)
      if (error instanceof HttpError) {
        request.response = lambdaErrorResponse(error);
        return;
      }

      // 3. Erro de Aplicação / Domínio (ApplicationError)
      if (error instanceof ApplicationError) {
        request.response = lambdaErrorResponse({
          statusCode: error.statusCode,
          code: error.code,
          message: error.message,
        });
        return;
      }

      // 4. Erro Inesperado (500)
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
