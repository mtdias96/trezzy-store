import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // globals: o Testing Library só limpa o DOM entre testes sozinho quando existe um afterEach global.
    globals: true,
    environment: 'jsdom',
  },
});
