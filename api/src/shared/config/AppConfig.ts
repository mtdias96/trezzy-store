import { Injectable } from '@kernel/decorators/Injectable.js';

import { env } from './env.js';

@Injectable()
export class AppConfig {
  readonly db: AppConfig.Database;

  constructor() {
    this.db = {
      neon: {
        url: env.DATABASE_URL,
      },
    };
  }
}

export namespace AppConfig {
  export type Database = {
    neon: {
      url: string;
    };
  };
}

