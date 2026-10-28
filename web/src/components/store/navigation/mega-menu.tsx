'use client';

import { type ReactNode, useRef } from 'react';

import { NavigationMenu, NavigationMenuList, NavigationMenuPositioner } from '@/components/ui/navigation-menu';

type MegaMenuProps = {
  label: string;
  children: ReactNode;
};

// O painel se ancora no <header>, e não no item, para abrir em largura cheia logo abaixo dele.
// hidden lg:block: o painel some se a tela encolher com ele aberto.
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
