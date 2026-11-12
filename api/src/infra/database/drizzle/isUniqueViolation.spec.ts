import { DrizzleQueryError } from 'drizzle-orm/errors';
import { describe, expect, it } from 'vitest';

import { isUniqueViolation } from './isUniqueViolation';

const queryError = (cause: unknown) => new DrizzleQueryError('insert into product_media ...', [], cause as Error);

describe('isUniqueViolation', () => {
  it('matches a unique violation on the given constraint', () => {
    expect(isUniqueViolation(queryError({ code: '23505', constraint: 'product_media_pkey' }), 'product_media_pkey')).toBe(true);
  });

  it('ignores a unique violation on another constraint', () => {
    expect(isUniqueViolation(queryError({ code: '23505', constraint: 'products_slug_unique' }), 'product_media_pkey')).toBe(false);
  });

  it('ignores other database errors and errors not raised by a query', () => {
    expect(isUniqueViolation(queryError({ code: '23503', constraint: 'product_media_pkey' }), 'product_media_pkey')).toBe(false);
    expect(isUniqueViolation(new Error('boom'), 'product_media_pkey')).toBe(false);
  });
});
