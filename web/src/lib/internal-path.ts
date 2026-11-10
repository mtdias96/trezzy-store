import * as z from 'zod';

// Uma barra só: "//site.com" e "/\site.com" levam o navegador para outro domínio. Tab e quebra de linha ficam de fora
// porque o navegador os remove antes de ler a URL, e "/<tab>/site.com" cairia no mesmo caso.
export const internalPathSchema = z.string().regex(/^\/(?![/\\])[^\t\r\n]*$/);
