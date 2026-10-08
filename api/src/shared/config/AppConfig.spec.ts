import { describe, expect, it } from 'vitest';

import { Registry } from '@kernel/di/Registry.js';

import { AppConfig } from './AppConfig.js';

describe('AppConfig', () => {
  it('should initialize and provide neon database configuration', () => {
    const config = Registry.getInstance().resolve(AppConfig);

    expect(config).toBeInstanceOf(AppConfig);
    expect(config.db.neon.url).toBe('postgresql://postgres:postgres@localhost:5432/trezzy_test');
  });

  it('should resolve as a singleton instance', () => {
    const instance1 = Registry.getInstance().resolve(AppConfig);
    const instance2 = Registry.getInstance().resolve(AppConfig);

    expect(instance1).toBe(instance2);
  });
});

