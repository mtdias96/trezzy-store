import type { ReactNode } from 'react';
import Link from 'next/link';

import { PageContainer } from '@/components/store/layout/page-container';

import { StoreLogo } from './store-logo';

type StoreHeaderProps = {
  announcements: ReactNode;
  mobileNav: ReactNode;
  nav: ReactNode;
  search: ReactNode;
  account: ReactNode;
  bag: ReactNode;
};

// Sticky com top negativo do tamanho da faixa de avisos (h-10): a faixa sai com a rolagem, e a navegação fica.
export function StoreHeader({ announcements, mobileNav, nav, search, account, bag }: StoreHeaderProps) {
  return (
    <header className="sticky -top-10 z-40 bg-ink text-gray-0">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-pill focus:bg-lime focus:px-4 focus:py-2 focus:text-body focus:font-bold focus:text-ink"
      >
        Pular para o conteúdo
      </a>
      {announcements}
      <PageContainer className="flex h-16 items-center gap-1 lg:h-17 lg:gap-6 xl:gap-8">
        <div className="-ml-2.5 lg:hidden">{mobileNav}</div>
        <Link href="/" aria-label="Trezzy Store, página inicial" className="shrink-0 rounded-md">
          <StoreLogo />
        </Link>
        <div className="hidden lg:block">{nav}</div>
        <div className="ml-auto flex min-w-0 items-center gap-1">
          {search}
          <div className="hidden lg:block">{account}</div>
          {bag}
        </div>
      </PageContainer>
    </header>
  );
}
