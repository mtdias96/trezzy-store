import { AdminLogo } from '@/components/admin/admin-logo';

import { PanelMarquee } from './panel-marquee';

const PANEL_AREAS = ['Estoque', 'Produtos', 'Cupons', 'Marcas', 'Clientes', 'Pedidos'] as const;

// pt-8 e pb-13 iguais aos do <main> do AuthShell: o texto fica no mesmo centro ótico do formulário.
export function AuthShowcase() {
  return (
    <aside className="hidden bg-brand-950 text-gray-0 md:flex md:flex-col">
      <div className="flex h-23 shrink-0 items-center px-12 lg:px-16 xl:px-20">
        <AdminLogo size="lg" />
      </div>

      <div className="flex flex-1 flex-col justify-center px-12 pt-8 pb-13 lg:px-16 xl:px-20">
        <p className="type-display text-display-xl lg:text-display-2xl">
          <span className="block">O corre</span>
          <span className="block">da loja</span>
          <span className="block">começa aqui</span>
        </p>

        <p className="mt-4.5 w-fit rotate-sticker font-hand text-hand tracking-widest text-lime">Bora vender!</p>

        <p className="mt-5 text-body-lg text-pretty text-brand-100/85">
          <span className="block">Pedidos, estoque, drops e cupons da Trezzy num lugar só.</span>
          <span className="block">Acesso exclusivo para a equipe com perfil ADMIN.</span>
        </p>
      </div>

      <PanelMarquee items={PANEL_AREAS} />
    </aside>
  );
}
