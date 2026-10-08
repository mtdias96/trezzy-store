import type { MiddlewareObj } from '@middy/core';
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { HttpError } from '../../../application/errors/HttpError.js';

interface IValidationIssue {
  path?: (string | number)[];
  message: string;
}

interface IValidationError {
  name?: string;
  issues: IValidationIssue[];
}

function isValidationError(error: unknown): error is IValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('issues' in error || (error as { name?: string }).name === 'ZodError') &&
    Array.isArray((error as { issues?: unknown }).issues)
  );
}

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

export function errorHandler(): MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2> {
  return {
    onError: (request) => {
      const { error } = request;

      if (!error) {
        return;
      }

      // 1. Zod / Schema validation errors -> 400 Bad Request
      if (isValidationError(error)) {
        const issues = error.issues.map((issue) => ({
          field: Array.isArray(issue.path) ? issue.path.join('.') : undefined,
          message: issue.message,
        }));

        request.response = createErrorResponse(400, {
          message: 'Validation failed',
          issues,
        });
        return;
      }

      // 2. Operational HTTP errors (HttpError)
      if (error instanceof HttpError) {
        request.response = createErrorResponse(error.statusCode, {
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        });
        return;
      }

      // 3. Unhandled server errors -> 500
      // eslint-disable-next-line no-console
      console.error(error);

      request.response = createErrorResponse(500, {
        message: 'Internal server error',
      });
    },
  };
}
