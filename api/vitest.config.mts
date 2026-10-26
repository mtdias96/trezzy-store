import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'node',
    env: {
      REGION: 'sa-east-1',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/trezzy_test',
      COGNITO_POOL_ID: 'sa-east-1_test',
      COGNITO_CLIENT_ID: 'test-client-id',
      COGNITO_CLIENT_SECRET: 'test-client-secret',
    },
  },
});

