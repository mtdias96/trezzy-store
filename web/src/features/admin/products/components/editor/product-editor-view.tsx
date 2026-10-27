import type { ReactNode } from 'react';

import { ProductEditorHeader } from './product-editor-header';

type ProductEditorViewProps = {
  main: ReactNode;
  aside: ReactNode;
};

export function ProductEditorView({ main, aside }: ProductEditorViewProps) {
  return (
    <div className="flex flex-1 flex-col">
      <ProductEditorHeader />
      <div className="mx-auto flex w-full max-w-310 flex-col gap-5.5 px-5 py-6 sm:px-8 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-5.5">{main}</div>
        <div className="flex flex-col gap-5.5 lg:w-85 lg:shrink-0">{aside}</div>
      </div>
    </div>
  );
}
