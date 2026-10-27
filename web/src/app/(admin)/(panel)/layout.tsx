import { Suspense } from 'react';

import { PanelHeader } from '@/components/admin/panel-header';
import { PanelNotifications } from '@/components/admin/panel-notifications';
import { PanelSidebar } from '@/components/admin/panel-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UserMenuSkeleton } from '@/features/admin/account/components/user-menu-skeleton';
import { UserMenuContainer } from '@/features/admin/account/containers/user-menu-container';
import { DashboardGreeting } from '@/features/admin/dashboard/components/dashboard-greeting';
import { PanelHeading } from '@/features/admin/navigation/components/panel-heading';
import { PanelNavSkeleton } from '@/features/admin/navigation/components/panel-nav-skeleton';
import { PanelNavContainer } from '@/features/admin/navigation/containers/panel-nav-container';
import { CommandPaletteContainer } from '@/features/admin/search/containers/command-palette-container';
import { signOut } from '@/features/shared/auth/data/actions';

// PRÉVIA (não commitar): contador fixo. O de verdade vem da API de notificações.
const PREVIEW_UNREAD_NOTIFICATIONS = 3;

// Painel logado. O layout é só a casca e não lê a sessão: um await aqui seguraria todas as páginas atrás da
// requisição. Quem confere a sessão é o proxy (redirect otimista) e cada query do painel (requireAdminSession).
// O que depende da conta (menu e usuário) entra num Suspense, e o resto fica na casca estática.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <PanelSidebar>
          <Suspense fallback={<PanelNavSkeleton />}>
            <PanelNavContainer />
          </Suspense>
        </PanelSidebar>
        <SidebarInset>
          <PanelHeader
            heading={<PanelHeading greeting={<DashboardGreeting />} />}
            search={<CommandPaletteContainer />}
            notifications={<PanelNotifications unread={PREVIEW_UNREAD_NOTIFICATIONS} />}
            account={(
              <Suspense fallback={<UserMenuSkeleton />}>
                <UserMenuContainer signOutAction={signOut} />
              </Suspense>
            )}
          />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
