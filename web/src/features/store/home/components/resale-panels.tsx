'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

import type { ResalePanel } from '@/features/store/home/model/types';
import { twoDigits } from '@/lib/text';

type ResalePanelsProps = {
  panels: readonly ResalePanel[];
};

const IMAGE_SIZES = '(min-width: 1440px) 555px, (min-width: 960px) 60vw, 92vw';
const GLIDE = 'duration-glide ease-glide';

// No celular os painéis ficam empilhados e abertos. A partir do md, o último tocado segue aberto quando o mouse sai.
// O botão cobre o painel para o teclado também abrir a sanfona.
export function ResalePanels({ panels }: ResalePanelsProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <ul data-open={openIndex} className="flex flex-col gap-2 md:accordion md:h-full">
      {panels.map(({ id, eyebrow, title, description, imageUrl, imageAlt }, index) => {
        const isOpen = index === openIndex;
        const open = () => {
          setOpenIndex(index);
        };

        return (
          <li key={id} onPointerEnter={open}>
            <div className="relative h-full min-h-70 overflow-hidden rounded-tile bg-brand-950">
              <div className={`absolute inset-0 transition-transform ${GLIDE} ${isOpen ? '' : 'md:accordion-photo-closed'}`}>
                {imageUrl
                  ? <Image src={imageUrl} alt={imageAlt} fill sizes={IMAGE_SIZES} className="object-cover" />
                  : <ImageIcon aria-hidden className="absolute inset-0 m-auto size-7 text-gray-500/60" />}
              </div>
              <div aria-hidden className={`absolute inset-0 bg-linear-to-t from-ink/80 to-transparent to-65% transition-opacity ${GLIDE} ${isOpen ? '' : 'md:opacity-0'}`} />
              <div aria-hidden className={`absolute inset-0 hidden bg-ink/60 transition-opacity md:block ${GLIDE} ${isOpen ? 'opacity-0' : ''}`} />
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={open}
                onFocus={open}
                className="absolute inset-0 hidden focus-visible:-outline-offset-4 md:block"
              >
                <span className={`absolute bottom-7 left-0 flex accordion-closed-width justify-center transition-opacity ${GLIDE} ${isOpen ? 'opacity-0' : ''}`}>
                  <span className="rotate-180 text-panel-label text-gray-0 uppercase text-vertical">{eyebrow}</span>
                </span>
              </button>
              <span className={`absolute top-4 left-4 flex h-6 items-center rounded-pill px-2.5 text-micro font-extrabold text-gray-0 tabular-nums transition-colors ${GLIDE} ${isOpen ? 'bg-brand' : 'bg-brand md:bg-gray-0/16'}`}>
                {twoDigits(index + 1)}
              </span>
              <div className={`pointer-events-none absolute inset-x-0 bottom-0 p-7 pb-7.25 transition-opacity ${GLIDE} ${isOpen ? 'md:delay-100' : 'md:opacity-0'}`}>
                <p className="text-overline font-extrabold tracking-widest text-brand-300 uppercase">{eyebrow}</p>
                <h3 className="mt-2 text-panel-title text-gray-0">{title}</h3>
                <p className="mt-2.5 max-w-104 text-body-lg leading-5.5 text-pretty text-gray-250">{description}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
