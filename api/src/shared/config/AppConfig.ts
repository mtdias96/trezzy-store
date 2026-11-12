import { Injectable } from '@kernel/decorators/Injectable';

import { env } from './env';

@Injectable()
export class AppConfig {
  readonly db: AppConfig.Database;
  readonly auth: AppConfig.Auth;
  readonly storage: AppConfig.Storage;

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

    this.storage = {
      s3: {
        region: env.REGION,
        mediaBucket: env.MEDIA_BUCKET_NAME,
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

  export type Storage = {
    s3: {
      region: string;
      mediaBucket: string;
    };
  };
}
