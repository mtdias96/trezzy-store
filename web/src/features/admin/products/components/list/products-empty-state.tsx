import Link from 'next/link';
import { PlusIcon, ShirtIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function ProductsEmptyState() {
  return (
    <section
      aria-labelledby="products-empty-title"
      className="
        flex flex-1 flex-col items-center justify-center gap-4 rounded-card border border-dashed border-border bg-card
        px-6 py-16 text-center
      "
    >
      <span className="flex size-12 items-center justify-center rounded-pill bg-muted text-muted-foreground">
        <ShirtIcon aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <h2 id="products-empty-title" className="text-body-lg font-semibold">Você ainda não tem produtos</h2>
        <p className="text-body text-muted-foreground">Crie o seu primeiro produto para começar a vender.</p>
      </div>
      <Button size="lg" nativeButton={false} render={<Link href="/admin/produtos/novo" />}>
        <PlusIcon data-icon="inline-start" aria-hidden />
        Novo produto
      </Button>
    </section>
  );
}
