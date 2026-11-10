import { PageContainer } from '@/components/store/layout/page-container';
import type { StorePerk } from '@/features/store/home/model/types';
import { twoDigits } from '@/lib/text';

type StorePerksProps = {
  perks: readonly StorePerk[];
};

// As linhas entre os itens são o fundo da lista aparecendo no gap de 1px: servem tanto às 2 colunas do celular quanto
// às 4 do desktop.
export function StorePerks({ perks }: StorePerksProps) {
  return (
    <PageContainer>
      <ul aria-label="Vantagens da loja" className="grid grid-cols-2 gap-px border-y border-line bg-line lg:grid-cols-4">
        {perks.map((perk, index) => (
          <li key={perk.title} className="flex items-center gap-3 bg-gray-0 px-3 py-4 sm:px-5 sm:py-5">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-surface text-caption font-bold text-brand"
            >
              {twoDigits(index + 1)}
            </span>
            <div className="min-w-0">
              <p className="text-body font-bold text-ink">{perk.title}</p>
              <p className="mt-0.5 text-caption text-gray-700">{perk.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
