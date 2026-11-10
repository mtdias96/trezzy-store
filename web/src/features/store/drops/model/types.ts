import type { Route } from 'next';

export type Drop = {
  number: number;
  brand: string;
  title: string;
  description: string;
  startsAt: string;
  imageUrl: string;
  imageAlt: string;
  sticker: string | null;
  shortLabel: string;
  longLabel: string;
  caption: string;
};

export type DropStock
  = | { status: 'upcoming'; quantity: number; unit: 'pair' | 'piece' }
    | { status: 'available'; remaining: number }
    | { status: 'sold-out'; soldOutAfterMinutes: number };

export type CalendarDrop = {
  number: number;
  numberLabel: string;
  dateLabel: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  href: Route;
  status: DropStock['status'];
  stockLabel: string;
};

// O que muda com os pedidos e chega ao navegador por uma rota de vida curta, por cima do HTML em cache.
export type LiveDropStock = Pick<CalendarDrop, 'number' | 'status' | 'stockLabel'>;
