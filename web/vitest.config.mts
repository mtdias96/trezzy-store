import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // O Next resolve o 'server-only' sozinho; fora dele, o import vira um módulo vazio.
      'server-only': fileURLToPath(new URL('./test/server-only.ts', import.meta.url)),
    },
  },
  test: {
    // globals: o Testing Library só limpa o DOM entre testes sozinho quando existe um afterEach global.
    globals: true,
    environment: 'jsdom',
  },
});
