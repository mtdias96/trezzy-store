import { ErrorCode } from './ErrorCode.js';

export class ApplicationError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}
