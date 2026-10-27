import { SidebarMenuItem, SidebarMenuSkeleton } from '@/components/ui/sidebar';

import { PanelNavGroup } from './panel-nav-group';

const SKELETON_ITEMS = 3;

export function PanelNavSkeleton() {
  return (
    <PanelNavGroup>
      {Array.from({ length: SKELETON_ITEMS }, (_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </PanelNavGroup>
  );
}
