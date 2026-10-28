'use client';

import { type ReactNode, useRef } from 'react';

import { NavigationMenu, NavigationMenuList, NavigationMenuPositioner } from '@/components/ui/navigation-menu';

type MegaMenuProps = {
  label: string;
  children: ReactNode;
};

// Só a raiz é client: os itens e os painéis chegam renderizados no servidor, por children.
// O painel se ancora no <header> que contém o menu, e não no item: abre em largura cheia, logo abaixo dele.
// Abaixo do lg o menu some do header; o painel também, se a tela encolher com ele aberto.
export function MegaMenu({ label, children }: MegaMenuProps) {
  const rootRef = useRef<HTMLElement>(null);

  return (
    <NavigationMenu ref={rootRef} aria-label={label}>
      <NavigationMenuList>{children}</NavigationMenuList>
      <NavigationMenuPositioner
        anchor={() => rootRef.current?.closest('header') ?? null}
        className="hidden lg:block"
      />
    </NavigationMenu>
  );
}
