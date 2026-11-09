'use client';

import { useState } from 'react';
import type { getImageProps } from 'next/image';

import { useHeroSlideNear } from '@/components/store/data-display/hero-carousel';

type HeroBannerPictureProps = {
  image: Omit<ReturnType<typeof getImageProps>['props'], 'srcSet' | 'sizes'>;
  alt: string;
  srcSet: string | undefined;
  sizes: string | undefined;
};

const EMPTY_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// O <source> só entra quando o slide está para aparecer, e depois fica: assim a foto não disputa a rede com a abertura
// da página, e já está pronta na transição. O lazy não serve: fora da vista o slide só está deslocado, e ele buscaria a
// foto no meio da troca.
// Sem arte para o celular, o banner só aparece a partir do lg: o <source> baixa a foto só ali, e abaixo dele o <img>
// fica com um GIF vazio inline. A arte do celular, quando existir, entra no lugar do GIF.
export function HeroBannerPicture({ image, alt, srcSet, sizes }: HeroBannerPictureProps) {
  const near = useHeroSlideNear();
  const [requested, setRequested] = useState(near);

  if (near && !requested) {
    setRequested(true);
  }

  return (
    <picture>
      {requested ? <source media="(width >= 68.75rem)" srcSet={srcSet} sizes={sizes} /> : null}
      <img {...image} alt={alt} src={EMPTY_GIF} className="hero-edge-fade object-cover" />
    </picture>
  );
}
