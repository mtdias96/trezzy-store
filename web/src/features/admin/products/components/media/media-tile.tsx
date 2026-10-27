'use client';

import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon, XIcon } from 'lucide-react';

import type { MediaItem } from '@/features/admin/products/model/media';

type MediaTileProps = {
  item: MediaItem;
  position: number;
  onRemove: (id: string) => void;
};

export function MediaTile({ item, position, onRemove }: MediaTileProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const isCover = position === 1;

  return (
    <li
      ref={setNodeRef}
      data-dragging={isDragging || undefined}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="
        group relative aspect-4/5 w-30 overflow-hidden rounded-xl bg-muted
        data-dragging:z-10 data-dragging:shadow-pop
      "
    >
      <Image src={item.previewUrl} alt={`Imagem ${position}`} fill sizes="120px" className="object-cover" />
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Mover a imagem ${position}`}
        {...attributes}
        {...listeners}
        className="
          absolute top-2 left-2 flex size-6 cursor-grab touch-none items-center justify-center rounded-md bg-gray-0
          text-gray-700
          active:cursor-grabbing
        "
      >
        <GripVerticalIcon aria-hidden className="size-3.5" />
      </button>
      {item.status === 'uploading'
        ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-1.5 bg-ink/45 p-2.5">
              <span className="text-caption font-bold text-gray-0 tabular-nums">{`${item.progress}%`}</span>
              <div
                role="progressbar"
                aria-label={`Enviando a imagem ${position}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={item.progress}
                className="h-1 overflow-hidden rounded-pill bg-gray-0/30"
              >
                <div className="h-full rounded-pill bg-lime transition-all" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          )
        : null}
      {item.status === 'error'
        ? (
            <div className="pointer-events-none absolute inset-0 flex items-end bg-danger-700/60 p-2.5">
              <span className="text-caption font-semibold text-gray-0">Falha no envio</span>
            </div>
          )
        : null}
      {isCover && item.status === 'done'
        ? (
            <span
              className="
                absolute bottom-2 left-2 rounded-pill bg-lime px-2 py-1 text-micro font-extrabold text-ink uppercase
              "
            >
              Capa
            </span>
          )
        : null}
      <button
        type="button"
        aria-label={`Remover a imagem ${position}`}
        onClick={() => onRemove(item.id)}
        className="
          absolute top-2 right-2 flex size-6 items-center justify-center rounded-pill bg-brand text-gray-0
          transition-opacity
          pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100
        "
      >
        <XIcon aria-hidden className="size-3.5" />
      </button>
    </li>
  );
}
