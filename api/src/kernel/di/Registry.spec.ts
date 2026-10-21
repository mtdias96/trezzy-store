import { describe, expect, it } from 'vitest';

import { Injectable } from '@kernel/decorators/Injectable';

import { Registry } from './Registry';

describe('Registry', () => {
  it('resolves a class with no dependencies as a singleton', () => {
    class SimpleService {}

    const registry = Registry.getInstance();
    const instance1 = registry.resolve(SimpleService);
    const instance2 = registry.resolve(SimpleService);

    expect(instance1).toBeInstanceOf(SimpleService);
    expect(instance1).toBe(instance2);
  });

  it('autowires dependencies using @Injectable and design:paramtypes', () => {
    @Injectable()
    class DatabaseConnection {
      connected = true;
    }

    @Injectable()
    class UserRepository {
      constructor(public db: DatabaseConnection) {}
    }

    @Injectable()
    class UserService {
      constructor(public userRepo: UserRepository) {}
    }

    const registry = Registry.getInstance();
    const service = registry.resolve(UserService);

    expect(service).toBeInstanceOf(UserService);
    expect(service.userRepo).toBeInstanceOf(UserRepository);
    expect(service.userRepo.db).toBeInstanceOf(DatabaseConnection);
    expect(service.userRepo.db.connected).toBe(true);
  });

  it('is idempotent when a class is registered multiple times', () => {
    class DuplicateService {}

    const registry = Registry.getInstance();
    registry.register(DuplicateService);
    registry.register(DuplicateService);

    const instance = registry.resolve(DuplicateService);
    expect(instance).toBeInstanceOf(DuplicateService);
  });
});

