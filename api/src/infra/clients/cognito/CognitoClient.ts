import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class CognitoClient {
  public readonly client: CognitoIdentityProviderClient;

  constructor(private readonly appConfig: AppConfig) {
    this.client = new CognitoIdentityProviderClient({
      region: this.appConfig.auth.cognito.region,
    });
  }
}
