import { createHmac } from 'node:crypto';
import {
  AdminDeleteUserCommand,
  InitiateAuthCommand,
  InvalidParameterException,
  InvalidPasswordException,
  NotAuthorizedException,
  SignUpCommand,
  UsernameExistsException,
  UserNotConfirmedException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';

import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { CognitoClient } from '@infra/clients/cognito/CognitoClient';

@Injectable()
export class AuthGateway {
  constructor(
    private readonly cognitoClient: CognitoClient,
    private readonly appConfig: AppConfig,
  ) { }

  async signIn({ email, password }: AuthGateway.SignInParams): Promise<AuthGateway.SignInResult> {
    try {
      const { AuthenticationResult } = await this.cognitoClient.client.send(
        new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: this.appConfig.auth.cognito.client.id,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
            SECRET_HASH: this.getSecretHash(email),
          },
        }),
      );

      if (
        !AuthenticationResult?.AccessToken ||
        !AuthenticationResult.RefreshToken ||
        AuthenticationResult.ExpiresIn === undefined
      ) {
        throw new Error('Cognito InitiateAuth returned no tokens (unexpected challenge?).');
      }

      return {
        accessToken: AuthenticationResult.AccessToken,
        refreshToken: AuthenticationResult.RefreshToken,
        expiresIn: AuthenticationResult.ExpiresIn,
      };
    } catch (error) {
      if (error instanceof NotAuthorizedException || error instanceof UserNotFoundException) {
        throw new ApplicationError(ErrorCode.UNAUTHORIZED, 'Invalid email or password.');
      }

      if (error instanceof UserNotConfirmedException) {
        throw new ApplicationError(ErrorCode.FORBIDDEN, 'User is not confirmed.');
      }

      throw error;
    }
  }

  async signUp({ email, password, internalId }: AuthGateway.SignUpParams): Promise<AuthGateway.SignUpResult> {
    try {
      const { UserSub: externalId } = await this.cognitoClient.client.send(
        new SignUpCommand({
          ClientId: this.appConfig.auth.cognito.client.id,
          Username: email,
          Password: password,
          UserAttributes: [{ Name: 'custom:internalId', Value: internalId }],
          SecretHash: this.getSecretHash(email),
        }),
      );

      if (!externalId) {
        throw new Error('Cognito SignUp returned no UserSub.');
      }

      return { externalId };
    } catch (error) {
      if (error instanceof UsernameExistsException) {
        throw new ApplicationError(ErrorCode.CONFLICT, 'Email already in use.');
      }

      if (error instanceof InvalidPasswordException) {
        throw new ApplicationError(ErrorCode.BAD_REQUEST, 'Password does not meet the password policy.');
      }

      if (error instanceof InvalidParameterException) {
        throw new ApplicationError(ErrorCode.BAD_REQUEST, 'Invalid sign up data.');
      }

      throw error;
    }
  }

  async deleteUser({ externalId }: AuthGateway.DeleteUserParams): Promise<void> {
    await this.cognitoClient.client.send(
      new AdminDeleteUserCommand({
        UserPoolId: this.appConfig.auth.cognito.pool.id,
        Username: externalId,
      }),
    );
  }

  private getSecretHash(email: string): string {
    const { id, secret } = this.appConfig.auth.cognito.client;

    return createHmac('SHA256', secret)
      .update(`${email}${id}`)
      .digest('base64');
  }
}

export namespace AuthGateway {
  export type SignUpParams = {
    email: string;
    password: string;
    internalId: string;
  };

  export type SignUpResult = {
    externalId: string;
  };

  export type SignInParams = {
    email: string;
    password: string;
  };

  export type SignInResult = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };

  export type DeleteUserParams = {
    externalId: string;
  };
}
