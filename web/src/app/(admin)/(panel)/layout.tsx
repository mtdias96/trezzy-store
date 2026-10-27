import { Suspense } from 'react';

import { PanelHeader } from '@/components/admin/panel-header';
import { PanelSidebar } from '@/components/admin/panel-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PanelNavSkeleton } from '@/features/admin/navigation/components/panel-nav-skeleton';
import { PanelNavContainer } from '@/features/admin/navigation/containers/panel-nav-container';
import { signOut } from '@/features/shared/auth/data/actions';

// Painel logado. O layout é só a casca e não lê a sessão: um await aqui seguraria todas as páginas atrás da
// requisição. Quem confere a sessão é o proxy (redirect otimista) e cada query do painel (requireAdminSession).
// O que depende da conta (o menu) entra num Suspense, e o resto fica na casca estática.
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
          <PanelHeader signOutAction={signOut} />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
