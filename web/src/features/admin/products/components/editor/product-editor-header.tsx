import Link from 'next/link';
import { ChevronLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { PRODUCT_STATUS_LABELS } from '@/features/admin/products/model/status';
import type { ProductStatus } from '@/features/admin/products/model/types';

// Classes inteiras por tom: o cn trataria o text-caption como cor e o descartaria ao lado do text-brand-700.
const BADGE = 'inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 text-caption font-semibold';

const statusTone = {
  draft: { badge: `${BADGE} bg-brand-100 text-brand-700`, dot: 'size-1.5 rounded-pill bg-brand' },
  active: { badge: `${BADGE} bg-success-50 text-success-700`, dot: 'size-1.5 rounded-pill bg-success-500' },
  inactive: { badge: `${BADGE} bg-gray-150 text-gray-700`, dot: 'size-1.5 rounded-pill bg-gray-500' },
  archived: { badge: `${BADGE} bg-gray-150 text-gray-700`, dot: 'size-1.5 rounded-pill bg-gray-500' },
} satisfies Record<ProductStatus, { badge: string; dot: string }>;

type ProductEditorHeaderProps = {
  caption: string;
  title: string;
  status: ProductStatus;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  // Com motivo, o Salvar fica desligado e o motivo aparece no lugar do aviso de alterações.
  saveBlockedReason?: string;
};

export function ProductEditorHeader({
  caption,
  title,
  status,
  hasUnsavedChanges = false,
  isSaving = false,
  saveBlockedReason,
}: ProductEditorHeaderProps) {
  const tone = statusTone[status];

  return (
    <div className="border-b border-gray-150 bg-card md:sticky md:top-18 md:z-10">
      <div className="mx-auto flex w-full max-w-310 flex-wrap items-center gap-x-3 gap-y-3 px-5 py-3 sm:px-8">
        <Link
          href="/admin/produtos"
          aria-label="Voltar para produtos"
          className="
            flex size-10 shrink-0 items-center justify-center rounded-pill border border-border bg-card text-ink
            transition-colors
            hover:bg-gray-100
          "
        >
          <ChevronLeftIcon aria-hidden className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-caption text-muted-foreground">{caption}</p>
          <div className="mt-0.5 flex items-center gap-2.5">
            <h1 className="truncate type-display text-display-sm sm:text-display-md">{title}</h1>
            <span className={tone.badge}>
              <span aria-hidden className={tone.dot} />
              {PRODUCT_STATUS_LABELS[status]}
            </span>
          </div>
        </div>
        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
          {saveBlockedReason
            ? <p className="mr-auto text-body-sm text-muted-foreground sm:mr-0">{saveBlockedReason}</p>
            : null}
          {hasUnsavedChanges && !saveBlockedReason
            ? (
                <p
                  className="
                    mr-auto hidden items-center gap-2 rounded-pill bg-warning-50 px-3.5 py-2.5 text-body-sm font-medium
                    text-warning-700
                    sm:mr-0 sm:flex
                  "
                >
                  <span aria-hidden className="size-2 rounded-pill bg-warning-500" />
                  Alterações não salvas
                </p>
              )
            : null}
          <Button variant="outline" shape="pill" size="lg" className="font-semibold" nativeButton={false} render={<Link href="/admin/produtos" />}>
            Descartar
          </Button>
          <Button
            type="submit"
            variant="accent"
            shape="pill"
            size="lg"
            className="font-semibold"
            disabled={isSaving || saveBlockedReason !== undefined}
          >
            {isSaving ? 'Salvando…' : 'Salvar'}
            <Kbd className="h-6 rounded-md px-1.5">⌘S</Kbd>
          </Button>
        </div>
      </div>
    </div>
  );
}
