import { describe, expect, it } from 'vitest';

import { Registry } from '@kernel/di/Registry';

import { DrizzleClient } from './DrizzleClient';

describe('DrizzleClient', () => {
  it('should resolve via DI Registry as a singleton with AppConfig autowired', () => {
    const client1 = Registry.getInstance().resolve(DrizzleClient);
    const client2 = Registry.getInstance().resolve(DrizzleClient);

    expect(client1).toBeInstanceOf(DrizzleClient);
    expect(client1).toBe(client2);
  });

  it('should expose the Drizzle db instance and transaction method', () => {
    const client = Registry.getInstance().resolve(DrizzleClient);

    expect(client.db).toBeDefined();
    expect(typeof client.db.select).toBe('function');
    expect(typeof client.db.insert).toBe('function');
    expect(typeof client.db.update).toBe('function');
    expect(typeof client.db.delete).toBe('function');
    expect(typeof client.transaction).toBe('function');
  });
});

