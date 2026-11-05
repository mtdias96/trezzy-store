'use client';

import { type DragEvent, useId, useState } from 'react';
import { UploadIcon } from 'lucide-react';

import { MEDIA_ACCEPTED_TYPES } from '@/features/admin/products/model/media';
import { usePreventFileDrop } from '@/hooks/use-prevent-file-drop';

type MediaDropzoneProps = {
  onFiles: (files: File[]) => void;
};

export function MediaDropzone({ onFiles }: MediaDropzoneProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  usePreventFileDrop();

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    // O dragleave também dispara ao passar por cima de um filho: só sai quando o ponteiro deixa a área.
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    onFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <label
      htmlFor={inputId}
      data-dragging={isDragging || undefined}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="
        flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-gray-25 p-5
        transition-colors
        has-focus-visible:border-ring has-focus-visible:shadow-focus-brand
        data-dragging:border-brand data-dragging:bg-brand-50
      "
    >
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-pill border border-border bg-card text-ink"
      >
        <UploadIcon className="size-4.5" />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-body-lg font-semibold text-ink">
          Arraste imagens ou
          {' '}
          <span className="underline decoration-2 underline-offset-4">clique para enviar</span>
        </span>
        <span className="text-body-sm text-muted-foreground">
          JPG, PNG ou WEBP · até 10 MB cada · proporção 4:5 (ex.: 1600 × 2000 px)
        </span>
      </span>
      <input
        id={inputId}
        type="file"
        multiple
        accept={MEDIA_ACCEPTED_TYPES.join(',')}
        className="sr-only"
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          // Sem limpar, escolher de novo a mesma foto (depois de removê-la) não dispara o change.
          event.target.value = '';
        }}
      />
    </label>
  );
}
