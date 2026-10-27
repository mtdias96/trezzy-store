'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { findSection, PANEL_HOME_HREF } from '@/features/admin/navigation/model/nav';

type PanelHeadingProps = {
  greeting: ReactNode;
};

// O layout não renderiza de novo ao navegar: a troca entre saudação e breadcrumb é pela URL, no client.
export function PanelHeading({ greeting }: PanelHeadingProps) {
  const pathname = usePathname();

  if (pathname === PANEL_HOME_HREF) {
    return greeting;
  }

  const section = findSection(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href={PANEL_HOME_HREF} />}>Admin</BreadcrumbLink>
        </BreadcrumbItem>
        {section && section.href !== PANEL_HOME_HREF
          ? (
              <>
                <BreadcrumbSeparator>/</BreadcrumbSeparator>
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbPage className="truncate font-semibold">{section.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )
          : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
