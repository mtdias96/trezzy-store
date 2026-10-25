import { Injectable } from '@kernel/decorators/Injectable';

import { env } from './env';

@Injectable()
export class AppConfig {
  readonly db: AppConfig.Database;
  readonly auth: AppConfig.Auth;

  constructor() {
    this.db = {
      neon: {
        url: env.DATABASE_URL,
      },
    };

    this.auth = {
      cognito: {
        region: env.REGION,
        client: {
          id: env.COGNITO_CLIENT_ID,
          secret: env.COGNITO_CLIENT_SECRET,
        },
        pool: {
          id: env.COGNITO_POOL_ID,
        },
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

  export type Auth = {
    cognito: {
      region: string;
      client: {
        id: string;
        secret: string;
      };
      pool: {
        id: string;
      };
    };
  };
}
