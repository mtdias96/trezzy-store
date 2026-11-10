import { BrandsSection } from '@/features/store/catalog/components/brands/brands-section';
import { getFeaturedBrands } from '@/features/store/catalog/data/queries';

type BrandsContainerProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export async function BrandsContainer({ eyebrow, title, description }: BrandsContainerProps) {
  const brands = await getFeaturedBrands();

  return brands ? <BrandsSection eyebrow={eyebrow} title={title} description={description} brands={brands} /> : null;
}
