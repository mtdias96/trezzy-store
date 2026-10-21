import { Pool } from '@neondatabase/serverless';
import { drizzle, type NeonDatabase } from 'drizzle-orm/neon-serverless';

import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

import * as schema from './schema';

@Injectable()
export class DrizzleClient {
  private readonly pool: Pool;
  public readonly db: DrizzleClient.Instance;

  constructor(private readonly appConfig: AppConfig) {
    this.pool = new Pool({
      connectionString: this.appConfig.db.neon.url,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 1,
    });

    this.db = drizzle(this.pool, { schema, casing: 'snake_case' });
  }

  async transaction<T>(callback: (tx: DrizzleClient.Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export namespace DrizzleClient {
  export type Schema = typeof schema;
  export type Instance = NeonDatabase<Schema>;
  export type Transaction = Parameters<Parameters<Instance['transaction']>[0]>[0];
}

