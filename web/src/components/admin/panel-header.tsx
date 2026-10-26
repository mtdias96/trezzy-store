import { LogOutIcon } from 'lucide-react';

import { AdminLogo } from '@/components/admin/admin-logo';

type PanelHeaderProps = {
  signOutAction: () => Promise<void>;
};

export function PanelHeader({ signOutAction }: PanelHeaderProps) {
  return (
    <header className="flex h-18 shrink-0 items-center justify-between border-b border-border bg-card px-5 sm:px-8">
      <AdminLogo />
      <form action={signOutAction}>
        <button
          type="submit"
          className="flex h-ctl-lg items-center gap-2 rounded-pill border border-gray-250 px-4 text-body-sm font-semibold text-ink transition-colors duration-base hover:bg-gray-100 md:h-ctl"
        >
          <LogOutIcon aria-hidden className="size-4" />
          Sair
        </button>
      </form>
    </header>
  );
}
