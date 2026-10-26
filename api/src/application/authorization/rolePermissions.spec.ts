import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from './Permission';
import { ROLE_PERMISSIONS } from './rolePermissions';

describe('ROLE_PERMISSIONS', () => {
  it('grants the whole catalog to admin, so new permissions need no extra wiring', () => {
    expect(ROLE_PERMISSIONS.admin).toBe(PERMISSIONS);
  });

  it('grants no panel permission to customers', () => {
    expect(ROLE_PERMISSIONS.customer).toEqual([]);
  });
});
