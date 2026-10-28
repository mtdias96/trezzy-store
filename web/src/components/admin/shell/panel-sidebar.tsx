import type { ReactNode } from 'react';
import { ExternalLinkIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

import { AdminLogo, AdminLogoMark } from './admin-logo';
import { PanelSidebarToggle } from './panel-sidebar-toggle';

type PanelSidebarProps = {
  children: ReactNode;
};

export function PanelSidebar({ children }: PanelSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="relative h-18 justify-center px-6 text-gray-0 sidebar-collapsed:items-center sidebar-collapsed:px-0">
        {/* A largura anima por 200ms e a logo troca na hora: sem o clip, ela vaza por cima da página ao expandir. */}
        <div className="animate-appear overflow-x-clip sidebar-collapsed:hidden">
          <AdminLogo />
        </div>
        <div className="hidden animate-appear sidebar-collapsed:block">
          <AdminLogoMark />
        </div>
        <PanelSidebarToggle />
      </SidebarHeader>
      <SidebarContent>{children}</SidebarContent>
      <SidebarSeparator className="mx-0" />
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* <a>, e não <Link>: abre em outra aba, então não precisa de prefetch. */}
            <SidebarMenuButton tooltip="Ver loja" render={<a href="/" target="_blank" rel="noopener" />}>
              <ExternalLinkIcon aria-hidden />
              <span>
                Ver loja
                <span className="sr-only"> (abre em outra aba)</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
