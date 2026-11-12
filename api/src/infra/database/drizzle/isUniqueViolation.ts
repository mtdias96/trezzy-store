import { DrizzleQueryError } from 'drizzle-orm/errors';

// O Drizzle embrulha o erro do Postgres: o código e a constraint ficam no `cause`.
export function isUniqueViolation(error: unknown, constraint: string): boolean {
  if (!(error instanceof DrizzleQueryError) || typeof error.cause !== 'object' || error.cause === null) {
    return false;
  }

  const { code, constraint: violated } = error.cause as { code?: unknown; constraint?: unknown };

  return code === '23505' && violated === constraint;
}
