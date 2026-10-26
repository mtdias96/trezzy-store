import { PanelHeader } from '@/components/admin/panel-header';
import { signOut } from '@/features/shared/auth/data/actions';

// Painel logado. O layout é só a casca e não lê a sessão: um await aqui seguraria todas as páginas atrás da
// requisição. Quem confere a sessão é o proxy (redirect otimista) e cada query do painel (requireAdminSession).
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <PanelHeader signOutAction={signOut} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
