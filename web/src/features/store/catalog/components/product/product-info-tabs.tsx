import type { ReactNode } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProductDetail } from '@/features/store/catalog/model/types';

type ProductInfoTabsProps = {
  product: ProductDetail;
  sizeChart: ReactNode;
};

// keepMounted: o texto das abas escondidas vai no HTML, para os buscadores.
export function ProductInfoTabs({ product, sizeChart }: ProductInfoTabsProps) {
  const tabs = [
    { id: 'description', label: 'Descrição', content: product.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>) },
    {
      id: 'composition',
      label: 'Composição',
      content: (
        <ul className="list-disc pl-5">
          {product.composition.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ),
    },
    ...(sizeChart ? [{ id: 'size-chart', label: 'Medidas', content: sizeChart }] : []),
  ];

  return (
    <Tabs defaultValue="description">
      <TabsList aria-label="Informações do produto" activateOnFocus>
        {tabs.map(({ id, label }) => (
          <TabsTrigger key={id} value={id}>{label}</TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ id, content }) => (
        <TabsContent key={id} value={id} keepMounted className="mt-4 flex flex-col gap-3 text-body text-gray-800">
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
