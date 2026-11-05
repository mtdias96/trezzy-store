'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BoxIcon,
  LayoutGridIcon,
  type LucideIcon,
  ReceiptIcon,
  ShirtIcon,
  TagsIcon,
  TicketPercentIcon,
} from 'lucide-react';

import { SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { findActiveHref, type PanelNavId, type PanelNavItem } from '@/features/admin/navigation/model/nav';

import { PanelNavGroup } from './panel-nav-group';

type PanelNavProps = {
  items: PanelNavItem[];
};

// Componente não atravessa a fronteira server → client por props: o ícone é escolhido aqui, pelo id.
const NAV_ICONS = {
  dashboard: LayoutGridIcon,
  orders: ReceiptIcon,
  products: ShirtIcon,
  inventory: BoxIcon,
  coupons: TicketPercentIcon,
  'brands-categories': TagsIcon,
} satisfies Record<PanelNavId, LucideIcon>;

export function PanelNav({ items }: PanelNavProps) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const activeHref = findActiveHref(items.map(({ href }) => href), pathname);

  return (
    <PanelNavGroup>
      {items.map(({ id, label, href, badge }) => {
        const Icon = NAV_ICONS[id];
        const isActive = href === activeHref;

        return (
          <SidebarMenuItem key={id}>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={label}
              render={<Link href={href} aria-current={isActive ? 'page' : undefined} onClick={() => setOpenMobile(false)} />}
            >
              <Icon aria-hidden />
              <span>
                {label}
                {badge ? <span className="sr-only">{` (${badge})`}</span> : null}
              </span>
            </SidebarMenuButton>
            {badge
              ? (
                  <>
                    <SidebarMenuBadge aria-hidden>{badge}</SidebarMenuBadge>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute top-2 right-2 hidden size-2 rounded-pill bg-warning-500 sidebar-collapsed:block"
                    />
                  </>
                )
              : null}
          </SidebarMenuItem>
        );
      })}
    </PanelNavGroup>
  );
}
