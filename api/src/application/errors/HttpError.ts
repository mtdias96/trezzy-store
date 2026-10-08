import { ErrorCode } from './ErrorCode.js';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
    public readonly code?: ErrorCode,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
