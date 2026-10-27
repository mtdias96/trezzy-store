import type { Metadata } from 'next';

import { SectionPreview } from '@/components/admin/section-preview';

// PRÉVIA (não commitar): página vazia só para ver o breadcrumb e o item ativo no menu.
export const metadata: Metadata = {
  title: 'Marcas & Categorias',
};

export default function Page() {
  return <SectionPreview title="Marcas & Categorias" />;
}
