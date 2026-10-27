import type { ReactNode } from 'react';

import { PanelToday } from '@/components/admin/panel-today';
import { SidebarTrigger } from '@/components/ui/sidebar';

type PanelHeaderProps = {
  heading: ReactNode;
  search: ReactNode;
  notifications: ReactNode;
  account: ReactNode;
};

export function PanelHeader({ heading, search, notifications, account }: PanelHeaderProps) {
  return (
    <header className="flex h-18 shrink-0 items-center gap-3 border-b border-border bg-card px-5 sm:px-8">
      <SidebarTrigger className="-ml-3 size-11 shrink-0 md:hidden" />
      <div className="min-w-0 flex-1">{heading}</div>
      <div className="flex shrink-0 items-center gap-2 md:gap-4">
        {search}
        <PanelToday />
        {notifications}
        {account}
      </div>
    </header>
  );
}
