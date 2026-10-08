export default {
  'api/**/*.{ts,js,mjs}': () => [
    'pnpm --filter trezzy-api lint:fix',
    'pnpm --filter trezzy-api typecheck',
  ],
};

