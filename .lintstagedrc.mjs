export default {
  'api/**/*.{ts,js,mjs}': () => [
    'pnpm --filter trezzy-api lint:fix',
    'pnpm --filter trezzy-api typecheck',
  ],
  'web/**/*.{ts,tsx,mts,mjs,css}': () => [
    'pnpm --filter trezzy-web lint:fix',
    'pnpm --filter trezzy-web typecheck',
  ],
};

