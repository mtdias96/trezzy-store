import type { PreSignUpTriggerEvent } from 'aws-lambda';
import { describe, expect, it } from 'vitest';

import { handler } from './preSignUp';

describe('preSignUp trigger', () => {
  it('auto-confirms the user and verifies the email', async () => {
    const event = { response: {} } as unknown as PreSignUpTriggerEvent;

    const result = await handler(event);

    expect(result.response).toEqual({ autoConfirmUser: true, autoVerifyEmail: true });
  });
});
