import Form from 'next/form';
import Link from 'next/link';
import { SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { pendingRoute } from '@/lib/route';

const SEARCH_PATH = pendingRoute('/busca');

// A partir do xl, o campo: o <Form> do Next navega sem recarregar e funciona sem JS (GET /busca?q=).
// Abaixo, um ícone que abre a página da busca: entre 1100 e 1440px o campo não cabe ao lado dos itens do menu, e no
// celular ele ocuparia uma linha a mais no header. Quando falta espaço, é o campo que encolhe (até min-w-48).
export function HeaderSearch() {
  return (
    <>
      <Form action={SEARCH_PATH} role="search" className="relative mr-5 hidden w-64 min-w-48 xl:block">
        <label htmlFor="store-search" className="sr-only">
          Buscar na loja
        </label>
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-gray-500"
        />
        <Input
          id="store-search"
          variant="search"
          type="search"
          name="q"
          placeholder="Buscar tênis, marcas, óculos"
          autoComplete="off"
          enterKeyHint="search"
        />
      </Form>
      <Link
        href={SEARCH_PATH}
        aria-label="Buscar na loja"
        className="flex size-11 shrink-0 items-center justify-center rounded-pill transition-colors duration-base hover:bg-ink-soft xl:hidden"
      >
        <SearchIcon aria-hidden className="size-5" />
      </Link>
    </>
  );
}
