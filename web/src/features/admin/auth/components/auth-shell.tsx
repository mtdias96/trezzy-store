import type { ReactNode } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowUpRightIcon, LockIcon } from 'lucide-react';

import { AdminLogo } from '@/components/admin/admin-logo';

import { AuthShowcase } from './auth-showcase';

// Sem página em / ainda, o typedRoutes recusa o link: tirar o cast quando a home da loja entrar.
const STORE_HOME = '/' as Route;

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh flex-1 md:grid-cols-2">
      <AuthShowcase />

      <div className="flex flex-col bg-card">
        <header className="@container flex h-24 shrink-0 items-center px-5 sm:px-12 md:h-23 lg:px-16 xl:px-20">
          <AdminLogo className="md:hidden" />
          {/* O ::after leva a área de toque a 46px. Num celular de 320px, o "Ir para a" fica só para o leitor de tela. */}
          <Link
            href={STORE_HOME}
            className="relative ml-auto flex h-9.5 items-center gap-2 rounded-pill border border-gray-250 pr-3.5 pl-4 text-body-sm font-semibold whitespace-nowrap text-ink transition-colors duration-base after:absolute after:inset-x-0 after:-inset-y-1 hover:bg-gray-100"
          >
            <span>
              <span className="sr-only @xs:not-sr-only">Ir para a </span>
              loja
            </span>
            <ArrowUpRightIcon aria-hidden className="size-3.5" />
          </Link>
        </header>

        {/* Centro ótico: o pb maior que o pt sobe o formulário 10px acima do meio, como no design. */}
        <main className="flex flex-1 items-center justify-center px-5 pt-8 pb-13 sm:px-12 lg:px-16 xl:px-20">
          {children}
        </main>

        <footer className="flex h-9.5 shrink-0 items-center gap-2 border-t border-gray-150 px-5 text-caption text-gray-600 sm:px-12 lg:px-16 xl:px-20">
          <LockIcon aria-hidden className="size-3.5" />
          Conexão segura · tentativas de acesso são registradas
        </footer>
      </div>
    </div>
  );
}
