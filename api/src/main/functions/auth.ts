import 'reflect-metadata';

import { SignInController } from '@application/controllers/auth/SignInController';
import { SignOutController } from '@application/controllers/auth/SignOutController';
import { SignUpController } from '@application/controllers/auth/SignUpController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter([
  { method: 'POST', path: '/auth/signup', handler: SignUpController },
  { method: 'POST', path: '/auth/signin', handler: SignInController },
  { method: 'POST', path: '/auth/signout', handler: SignOutController },
]);
