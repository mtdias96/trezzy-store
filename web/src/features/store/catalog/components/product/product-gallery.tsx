'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon } from 'lucide-react';

import type { ProductImage } from '@/features/store/catalog/model/types';

type ProductGalleryProps = {
  images: readonly ProductImage[];
};

const PHOTO_SIZES = '(min-width: 1440px) 690px, (min-width: 1100px) 50vw, 100vw';

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

// A foto atual sai da posição da rolagem, que só é lida: sem escrita no mesmo quadro, não força layout.
export function ProductGallery({ images }: ProductGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const goTo = (index: number) => {
    const track = trackRef.current;

    track?.scrollTo({ left: index * track.clientWidth, behavior: scrollBehavior() });
  };

  const syncCurrent = () => {
    const track = trackRef.current;

    if (track) {
      setCurrent(Math.round(track.scrollLeft / track.clientWidth));
    }
  };

  if (total === 0) {
    return (
      <div className="relative aspect-4/5 rounded-block bg-paper-stone">
        <ImageIcon aria-hidden className="absolute inset-0 m-auto size-10 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {total > 1
        ? (
            // -inset-1 com p-1: o contorno do foco fica fora do corte da rolagem.
            <div className="relative hidden w-20 shrink-0 lg:block">
              <ul aria-label="Miniaturas" className="absolute -inset-1 scrollbar-none flex flex-col gap-3 overflow-y-auto p-1">
                {images.map(({ url }, index) => (
                  <li key={url}>
                    <button
                      type="button"
                      aria-label={`Ver foto ${index + 1} de ${total}`}
                      aria-current={index === current ? 'true' : undefined}
                      data-current={index === current ? '' : undefined}
                      onClick={() => goTo(index)}
                      className="relative block aspect-4/5 w-full overflow-hidden rounded-xl border-2 border-transparent bg-paper-stone transition-colors duration-base hover:border-paper-sand data-current:border-ink"
                    >
                      <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        : null}
      <div className="relative min-w-0 flex-1">
        <div
          ref={trackRef}
          onScroll={syncCurrent}
          role="region"
          aria-roledescription="carrossel"
          aria-label="Fotos do produto"
          tabIndex={0}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-block bg-paper-stone"
        >
          {images.map(({ url, alt }, index) => (
            <div
              key={url}
              role="group"
              aria-roledescription="foto"
              aria-label={`${index + 1} de ${total}`}
              className="relative aspect-4/5 w-full shrink-0 snap-center"
            >
              <Image
                src={url}
                alt={alt}
                fill
                sizes={PHOTO_SIZES}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : undefined}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {total > 1
          ? (
              <>
                <button
                  type="button"
                  aria-label="Foto anterior"
                  onClick={() => goTo(Math.max(0, current - 1))}
                  disabled={current === 0}
                  className="absolute top-1/2 left-3 hidden size-11 -translate-y-1/2 items-center justify-center rounded-pill bg-gray-0 text-ink shadow-knob transition-opacity duration-base disabled:opacity-0 lg:flex"
                >
                  <ChevronLeftIcon aria-hidden className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Próxima foto"
                  onClick={() => goTo(Math.min(total - 1, current + 1))}
                  disabled={current === total - 1}
                  className="absolute top-1/2 right-3 hidden size-11 -translate-y-1/2 items-center justify-center rounded-pill bg-gray-0 text-ink shadow-knob transition-opacity duration-base disabled:opacity-0 lg:flex"
                >
                  <ChevronRightIcon aria-hidden className="size-5" />
                </button>
                <div aria-hidden className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden">
                  {images.map(({ url }, index) => (
                    <span
                      key={url}
                      className={index === current ? 'h-1.5 w-4 rounded-pill bg-ink' : 'size-1.5 rounded-pill bg-ink/30'}
                    />
                  ))}
                </div>
              </>
            )
          : null}
      </div>
    </div>
  );
}
