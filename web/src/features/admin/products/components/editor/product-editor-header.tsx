import Link from 'next/link';
import { ChevronLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';

export function ProductEditorHeader() {
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
          <p className="text-caption text-muted-foreground">Produtos · novo cadastro</p>
          <div className="mt-0.5 flex items-center gap-2.5">
            <h1 className="truncate type-display text-display-sm sm:text-display-md">Novo produto</h1>
            <span
              className="
                inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-brand-100 px-2.5 py-1 text-caption font-semibold
                text-brand-700
              "
            >
              <span aria-hidden className="size-1.5 rounded-pill bg-brand" />
              Rascunho
            </span>
          </div>
        </div>
        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
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
          <Button variant="outline" shape="pill" size="lg" className="font-semibold">
            Descartar
          </Button>
          <Button variant="accent" shape="pill" size="lg" className="font-semibold">
            Salvar
            <Kbd className="h-6 rounded-md px-1.5">⌘S</Kbd>
          </Button>
        </div>
      </div>
    </div>
  );
}
