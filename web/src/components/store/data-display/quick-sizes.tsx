'use client';

import { useActionState, useEffect, useRef, useState } from 'react';

import type { ActionResult, FormAction } from '@/lib/action-result';
import { sizeLabel } from '@/lib/size';

export type QuickSizeOption = {
  size: string;
  // null: esgotado.
  variantId: string | null;
};

type QuickSizesProps = {
  options: readonly QuickSizeOption[];
  action: FormAction;
};

const labelClass = {
  idle: 'text-tag text-gray-700 uppercase',
  added: 'text-tag text-success-700 uppercase',
  failed: 'text-tag text-danger-700 uppercase',
} satisfies Record<'idle' | 'added' | 'failed', string>;

const chipClass = {
  available: 'flex h-8 min-w-9 items-center justify-center rounded-tag border border-divider bg-gray-0 px-2 text-body-sm font-semibold text-ink transition-colors duration-base hover:border-ink',
  soldOut: 'flex h-8 min-w-9 items-center justify-center rounded-tag border border-surface-media bg-surface px-2 text-body-sm font-semibold text-disabled line-through',
} satisfies Record<'available' | 'soldOut', string>;

// Atalho só de mouse: teclado e leitor de tela compram pela página do produto, que tem a escolha completa. Fora deles
// (aria-hidden e tabIndex -1) porque uma grade de 6 cards com 8 tamanhos seriam 48 paradas de Tab antes do rodapé.
// z-10: fica acima do link que cobre o card. O aviso some quando o mouse sai, para não reaparecer no próximo hover.
// O starting: faz a primeira subida animar, já que o painel nasce com o mouse em cima.
function QuickSizesPanel({ options, action }: QuickSizesProps) {
  const [result, submit, pending] = useActionState<ActionResult | null, FormData>(action, null);
  const [dismissed, setDismissed] = useState<ActionResult | null>(null);
  const feedback = result === dismissed ? null : result;
  const tone = feedback === null ? 'idle' : feedback.ok ? 'added' : 'failed';

  return (
    <form
      action={submit}
      aria-hidden
      onPointerLeave={() => setDismissed(result)}
      className="absolute inset-x-2 bottom-2 z-10 hidden max-h-full translate-y-full overflow-y-auto rounded-tile bg-gray-0/95 p-2.5 opacity-0 transition duration-base ease-out group-hover/card:translate-y-0 group-hover/card:opacity-100 starting:translate-y-full starting:opacity-0 pointer-fine:block"
    >
      <p className={labelClass[tone]}>
        {feedback === null ? 'Adicionar tamanho' : feedback.ok ? 'Adicionado à sacola' : feedback.error}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {options.map(({ size, variantId }) => (
          <button
            key={size}
            type="submit"
            name="variantId"
            value={variantId ?? ''}
            tabIndex={-1}
            disabled={variantId === null || pending}
            className={variantId === null ? chipClass.soldOut : chipClass.available}
          >
            {sizeLabel(size)}
          </button>
        ))}
      </div>
    </form>
  );
}

// O painel só nasce quando o mouse chega ao card: ele pesava 20% dos elementos da home, e o toque nunca o mostra.
// O pointermove cobre quem já estava com o mouse em cima quando a página hidratou, caso em que o pointerenter não vem.
export function QuickSizes(props: QuickSizesProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const card = anchorRef.current?.closest('article');

    if (!card) {
      return;
    }

    const open = ({ pointerType }: PointerEvent) => {
      if (pointerType !== 'touch') {
        setOpened(true);
      }
    };

    card.addEventListener('pointerenter', open);
    card.addEventListener('pointermove', open);

    return () => {
      card.removeEventListener('pointerenter', open);
      card.removeEventListener('pointermove', open);
    };
  }, [opened]);

  return opened ? <QuickSizesPanel {...props} /> : <span ref={anchorRef} hidden />;
}
