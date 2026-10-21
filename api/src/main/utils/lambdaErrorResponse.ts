import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

import { ErrorCode } from '@application/errors/ErrorCode';

export interface ILambdaErrorResponseParams {
  statusCode: number;
  code: ErrorCode;
  message: unknown;
}

export function lambdaErrorResponse({
  code,
  message,
  statusCode,
}: ILambdaErrorResponseParams): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      error: {
        code,
        message,
      },
    }),
  };
}
