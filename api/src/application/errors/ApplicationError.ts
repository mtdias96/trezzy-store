import { ErrorCode } from './ErrorCode';

export class ApplicationError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}
