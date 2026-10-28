import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';

import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import type { FeaturedProduct } from '@/features/store/navigation/model/types';
import { formatPrice } from '@/lib/money';

type MenuProductCardProps = {
  product: FeaturedProduct;
};

// alt vazio: o nome do produto já está no texto do link.
export function MenuProductCard({ product }: MenuProductCardProps) {
  return (
    <NavigationMenuLink
      render={<Link href={product.href} />}
      className="flex w-56 shrink-0 flex-col gap-1 rounded-2xl border border-paper-line p-1.5 pb-3 transition-colors duration-base hover:border-paper-sand xl:w-60"
    >
      <span className="relative mb-2 block aspect-4/5 overflow-hidden rounded-xl bg-paper-stone">
        {product.imageUrl
          ? <Image src={product.imageUrl} alt="" fill sizes="15rem" className="object-cover" />
          : <ImageIcon aria-hidden className="absolute inset-0 m-auto size-6 text-gray-500" />}
      </span>
      <span className="px-1 text-micro font-bold text-gray-700 uppercase">{product.brand}</span>
      <span className="px-1 text-body-sm font-medium text-ink">{product.name}</span>
      <span className="px-1 text-body font-bold text-ink">{formatPrice(product.priceInCents)}</span>
    </NavigationMenuLink>
  );
}
