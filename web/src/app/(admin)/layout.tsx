import type { Metadata } from 'next';

// Só tira o painel dos buscadores: quem protege as rotas é a API.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Painel: data-area="admin" troca as superfícies para os cinzas frios do globals.css.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div data-area="admin" className="flex flex-1 flex-col bg-background text-foreground">{children}</div>;
}
