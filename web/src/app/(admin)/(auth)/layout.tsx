import { AuthShell } from '@/features/admin/auth/components/auth-shell';

// Entrar (e, depois, recuperar a senha): tela dividida, sem a navegação do painel.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
