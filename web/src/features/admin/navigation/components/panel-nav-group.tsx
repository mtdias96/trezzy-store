import type { ReactNode } from 'react';

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';

type PanelNavGroupProps = {
  children: ReactNode;
};

export function PanelNavGroup({ children }: PanelNavGroupProps) {
  return (
    <SidebarGroup className="p-3">
      <SidebarGroupLabel className="px-3">Menu principal</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">{children}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
