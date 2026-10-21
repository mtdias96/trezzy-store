import { ApplicationError } from './ApplicationError';
import { ErrorCode } from './ErrorCode';

export class ValidationError extends ApplicationError {
  constructor(public readonly issues: ValidationError.Issue[]) {
    super(ErrorCode.VALIDATION, 'Invalid request.');
    this.name = 'ValidationError';
  }
}

export namespace ValidationError {
  export type Issue = {
    field: string;
    error: string;
  };
}
