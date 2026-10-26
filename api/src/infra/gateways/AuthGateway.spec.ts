import { createHmac } from 'node:crypto';
import {
  AdminDeleteUserCommand,
  InitiateAuthCommand,
  NotAuthorizedException,
  RevokeTokenCommand,
  SignUpCommand,
  UnauthorizedException,
  UnsupportedOperationException,
  UnsupportedTokenTypeException,
  UsernameExistsException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { describe, expect, it, vi } from 'vitest';

import type { AppConfig } from '@shared/config/AppConfig';
import { ApplicationError } from '@application/errors/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import type { CognitoClient } from '@infra/clients/cognito/CognitoClient';

import { AuthGateway } from './AuthGateway';

const appConfig = {
  auth: { cognito: { region: 'sa-east-1', client: { id: 'client-1', secret: 'secret-1' }, pool: { id: 'pool-1' } } },
} as unknown as AppConfig;

const secretHash = (email: string) => createHmac('SHA256', 'secret-1').update(`${email}client-1`).digest('base64');

function makeSut() {
  const send = vi.fn();
  const cognitoClient = { client: { send } } as unknown as CognitoClient;
  const sut = new AuthGateway(cognitoClient, appConfig);

  return { sut, send };
}

const cognitoError = (ErrorClass: new (opts: { message: string; $metadata: object }) => Error) =>
  new ErrorClass({ message: 'cognito says no', $metadata: {} });

describe('AuthGateway', () => {
  it('signUp sends the internalId and the secret hash, and returns the sub as externalId', async () => {
    const { sut, send } = makeSut();
    send.mockResolvedValue({ UserSub: 'sub-1' });

    await expect(sut.signUp({ email: 'a@b.com', password: 'Secret123', internalId: 'acc-1' })).resolves.toEqual({
      externalId: 'sub-1',
    });

    const [command] = send.mock.calls[0]!;
    expect(command).toBeInstanceOf(SignUpCommand);
    expect(command.input).toEqual({
      ClientId: 'client-1',
      Username: 'a@b.com',
      Password: 'Secret123',
      UserAttributes: [{ Name: 'custom:internalId', Value: 'acc-1' }],
      SecretHash: secretHash('a@b.com'),
    });
  });

  it('signUp maps UsernameExistsException to CONFLICT', async () => {
    const { sut, send } = makeSut();
    send.mockRejectedValue(cognitoError(UsernameExistsException));

    await expect(sut.signUp({ email: 'a@b.com', password: 'Secret123', internalId: 'acc-1' })).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
    });
  });

  it('signIn uses USER_PASSWORD_AUTH with the secret hash and returns the tokens', async () => {
    const { sut, send } = makeSut();
    send.mockResolvedValue({
      AuthenticationResult: { AccessToken: 'access', RefreshToken: 'refresh', ExpiresIn: 3600 },
    });

    await expect(sut.signIn({ email: 'a@b.com', password: 'Secret123' })).resolves.toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 3600,
    });

    const [command] = send.mock.calls[0]!;
    expect(command).toBeInstanceOf(InitiateAuthCommand);
    expect(command.input).toEqual({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: 'client-1',
      AuthParameters: { USERNAME: 'a@b.com', PASSWORD: 'Secret123', SECRET_HASH: secretHash('a@b.com') },
    });
  });

  it.each([NotAuthorizedException, UserNotFoundException])(
    'signIn maps %o to UNAUTHORIZED with the same message',
    async (ErrorClass) => {
      const { sut, send } = makeSut();
      send.mockRejectedValue(cognitoError(ErrorClass));

      await expect(sut.signIn({ email: 'a@b.com', password: 'wrong' })).rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Invalid email or password.',
      });
    },
  );

  it('propagates unknown SDK errors without wrapping them', async () => {
    const { sut, send } = makeSut();
    const error = new Error('throttled');
    send.mockRejectedValue(error);

    await expect(sut.signIn({ email: 'a@b.com', password: 'x' })).rejects.toBe(error);
    await expect(sut.signIn({ email: 'a@b.com', password: 'x' })).rejects.not.toBeInstanceOf(ApplicationError);
  });

  it('deleteUser removes the user through the Admin API', async () => {
    const { sut, send } = makeSut();
    send.mockResolvedValue({});

    await sut.deleteUser({ externalId: 'sub-1' });

    const [command] = send.mock.calls[0]!;
    expect(command).toBeInstanceOf(AdminDeleteUserCommand);
    expect(command.input).toEqual({ UserPoolId: 'pool-1', Username: 'sub-1' });
  });

  it('signOut revokes the refresh token with the client secret', async () => {
    const { sut, send } = makeSut();
    send.mockResolvedValue({});

    await sut.signOut({ refreshToken: 'refresh-1' });

    const [command] = send.mock.calls[0]!;
    expect(command).toBeInstanceOf(RevokeTokenCommand);
    expect(command.input).toEqual({ Token: 'refresh-1', ClientId: 'client-1', ClientSecret: 'secret-1' });
  });

  it.each([UnsupportedOperationException, UnsupportedTokenTypeException])(
    'signOut maps %o (e.g. an access token sent by mistake) to BAD_REQUEST',
    async (ErrorClass) => {
      const { sut, send } = makeSut();
      send.mockRejectedValue(cognitoError(ErrorClass));

      await expect(sut.signOut({ refreshToken: 'eyJ.access.token' })).rejects.toMatchObject({
        code: ErrorCode.BAD_REQUEST,
        message: 'Invalid refresh token.',
      });
    },
  );

  it('signOut propagates UnauthorizedException, since a wrong client secret is our bug, not the client\'s', async () => {
    const { sut, send } = makeSut();
    const error = cognitoError(UnauthorizedException);
    send.mockRejectedValue(error);

    await expect(sut.signOut({ refreshToken: 'refresh-1' })).rejects.toBe(error);
  });
});
