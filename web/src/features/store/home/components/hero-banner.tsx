import { getImageProps } from 'next/image';
import Link from 'next/link';

import type { HomeBanner } from '@/features/store/home/model/types';

import { HeroBannerPicture } from './hero-banner-picture';

type HeroBannerProps = {
  banner: HomeBanner;
};

// O espaçador dá a altura mínima do banner. Ao lado do slide do drop, que é mais alto, o carrossel estica o banner, e a
// foto cobre o slide inteiro.
export function HeroBanner({ banner }: HeroBannerProps) {
  const { props: { srcSet, sizes, ...image } } = getImageProps({
    src: banner.imageUrl,
    alt: banner.imageAlt,
    fill: true,
    sizes: '(min-width: 1920px) 1920px, 100vw',
    loading: 'eager',
  });

  return (
    <Link href={banner.href} className="block bg-ink focus-visible:-outline-offset-4">
      <span className="relative hero-frame block h-full">
        <span aria-hidden className="block aspect-video lg:aspect-21/9" />
        <HeroBannerPicture image={image} alt={banner.imageAlt} srcSet={srcSet} sizes={sizes} />
      </span>
    </Link>
  );
}
