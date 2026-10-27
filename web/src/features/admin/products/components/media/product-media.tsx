'use client';

import { useId } from 'react';
import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { GripVerticalIcon } from 'lucide-react';

import { FormCard } from '@/components/admin/forms/form-card';
import { formatImageCount, type MediaItem, type MediaRejection } from '@/features/admin/products/model/media';

import { MediaDropzone } from './media-dropzone';
import { MediaTile } from './media-tile';

type ProductMediaProps = {
  items: readonly MediaItem[];
  rejections: readonly MediaRejection[];
  onFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
};

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'Para mover a imagem, aperte espaço ou Enter. Use as setas para trocar de posição e aperte espaço ou Enter de '
    + 'novo para soltar, ou Esc para cancelar.',
};

export function ProductMedia({ items, rejections, onFiles, onRemove, onReorder }: ProductMediaProps) {
  // Sem id fixo, o DndContext numera os próprios ids por contador, e o servidor e o browser divergem na hidratação.
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function positionOf(id: UniqueIdentifier): number {
    return items.findIndex((item) => item.id === id) + 1;
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Imagem ${positionOf(active.id)} selecionada.`,
    onDragOver: ({ active, over }) =>
      over ? `Imagem ${positionOf(active.id)} na posição ${positionOf(over.id)}.` : 'Imagem fora da lista.',
    onDragEnd: ({ active, over }) =>
      over ? `Imagem ${positionOf(active.id)} solta na posição ${positionOf(over.id)}.` : 'Imagem solta fora da lista.',
    onDragCancel: () => 'Movimento cancelado.',
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  }

  return (
    <FormCard title="Mídia" meta={formatImageCount(items.length)}>
      <MediaDropzone onFiles={onFiles} />
      {rejections.length > 0
        ? (
            <ul role="alert" className="flex flex-col gap-1 text-body-sm text-danger-600">
              {rejections.map(({ name, reason }) => (
                <li key={name}>{`${name}: ${reason}.`}</li>
              ))}
            </ul>
          )
        : null}
      {items.length > 0
        ? (
            <>
              <DndContext
                id={dndId}
                sensors={sensors}
                collisionDetection={closestCenter}
                accessibility={{ announcements, screenReaderInstructions }}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={items.map(({ id }) => id)} strategy={rectSortingStrategy}>
                  <ul aria-label="Imagens do produto" className="flex flex-wrap gap-2.5">
                    {items.map((item, index) => (
                      <MediaTile key={item.id} item={item} position={index + 1} onRemove={onRemove} />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
              <p className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
                <GripVerticalIcon aria-hidden className="size-3.5" />
                Arraste para reordenar · a primeira imagem é a capa na loja
              </p>
            </>
          )
        : null}
    </FormCard>
  );
}
