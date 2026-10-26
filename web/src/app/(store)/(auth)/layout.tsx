// Entrar e cadastro: layout enxuto, sem o header da loja.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col items-center justify-center">{children}</div>;
}
