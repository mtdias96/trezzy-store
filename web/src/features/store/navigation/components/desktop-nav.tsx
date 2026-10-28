import type { ReactNode } from 'react';
import Link from 'next/link';

import { MegaMenu } from '@/components/store/navigation/mega-menu';
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import type { StoreMenu } from '@/features/store/navigation/model/types';

import { DepartmentPanel } from './department-panel';

type DesktopNavProps = {
  menu: StoreMenu;
  // Repetido no fim de cada painel.
  promo?: ReactNode;
};

// keepMounted: os painéis fechados ficam no HTML (escondidos), e os buscadores encontram os links das categorias.
export function DesktopNav({ menu, promo }: DesktopNavProps) {
  return (
    <MegaMenu label="Principal">
      {menu.entries.map((entry) =>
        entry.kind === 'link'
          ? (
              <NavigationMenuItem key={entry.href}>
                <NavigationMenuLink render={<Link href={entry.href} />} className={navigationMenuTriggerStyle()}>
                  {entry.highlight ? <span aria-hidden className="size-1.5 rounded-pill bg-lime" /> : null}
                  {entry.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          : (
              <NavigationMenuItem key={entry.id} value={entry.id}>
                <NavigationMenuTrigger>{entry.label}</NavigationMenuTrigger>
                <NavigationMenuContent keepMounted>
                  <DepartmentPanel department={entry} promo={promo} />
                </NavigationMenuContent>
              </NavigationMenuItem>
            ),
      )}
    </MegaMenu>
  );
}
