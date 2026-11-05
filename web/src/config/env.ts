import 'server-only';

import * as z from 'zod';

// Variáveis do servidor, validadas quando o módulo carrega: faltou uma, o build e o boot falham.
// Variável nova entra aqui, no .env.example e nas variáveis do projeto na Vercel.
const envSchema = z.object({
  // Sem barra no final: o lib/http.ts concatena o caminho ('/products').
  API_URL: z.url().transform((url) => url.replace(/\/+$/, '')),
});

export const env = envSchema.parse({
  API_URL: process.env.API_URL,
});
