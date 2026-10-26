// Painel: data-area="admin" troca as superfícies para os cinzas frios do globals.css.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div data-area="admin" className="flex flex-1 flex-col bg-background text-foreground">{children}</div>;
}
