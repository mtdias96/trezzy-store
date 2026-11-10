import { createLucideIcon, GlassesIcon, type LucideIcon, ShirtIcon, TagIcon } from 'lucide-react';

import type { PieceIconName } from '@/features/store/catalog/model/types';

// O lucide não tem estas peças. Mesma grade de 24 e traço arredondado, para ficarem iguais às que vêm dele.
const SneakerIcon = createLucideIcon('sneaker', [
  ['path', { d: 'M3.3 16.2V8.6a.7.7 0 0 1 .7-.7h3a1 1 0 0 1 .8.4l2.1 2.7c3.1.2 6.6.9 8.6 2.5 1.5.8 2.6 1.7 3.1 2.7z', key: 'upper' }],
  ['path', { d: 'M3.3 16.2h18.3c.2 1.5 0 2.8-.5 2.8H3.3z', key: 'sole' }],
  ['path', { d: 'm10.5 11.3-.9 2', key: 'lace-a' }],
  ['path', { d: 'm13.5 11.8-.9 2', key: 'lace-b' }],
]);

const HoodieIcon = createLucideIcon('hoodie', [
  ['path', { d: 'M8.3 3C6.4 3 5 4.3 4.3 6.3l-1.4 4.6h2v10h14.2v-10h2l-1.4-4.6C19 4.3 17.6 3 15.7 3c-.7 2.5-2.2 4.4-3.7 5.2C10.5 7.4 9 5.5 8.3 3z', key: 'body' }],
  ['path', { d: 'M11 8.5v3', key: 'cord-a' }],
  ['path', { d: 'M13 8.5v3', key: 'cord-b' }],
  ['rect', { x: '8.8', y: '15', width: '6.4', height: '3', key: 'pocket' }],
]);

const JacketIcon = createLucideIcon('jacket', [
  ['path', { d: 'M3.1 19.9 4 6.2c.7-1.8 2-3 4-3 1.6 0 3 .6 4 1.6 1-1 2.4-1.6 4-1.6 2 0 3.3 1.2 4 3l.9 13.7z', key: 'body' }],
  ['path', { d: 'M8.2 3h7.6', key: 'collar' }],
  ['path', { d: 'M12 3v18.7', key: 'zipper' }],
  ['path', { d: 'M14.6 13h1.8', key: 'pocket' }],
]);

const PantsIcon = createLucideIcon('pants', [
  ['path', { d: 'M6 3h12l.9 17.9h-5.3L12 9.5l-1.6 11.4H5.1z', key: 'legs' }],
  ['path', { d: 'M5.8 7.1h12.4', key: 'waist' }],
]);

const ShortsIcon = createLucideIcon('shorts', [
  ['path', { d: 'M5 5h14l1 11.9h-5.9L12 11.5l-2.1 5.4H4z', key: 'legs' }],
  ['path', { d: 'M4.7 8.8h14.6', key: 'waist' }],
]);

const CapIcon = createLucideIcon('cap', [
  ['path', { d: 'M3.4 15c0-4.5 3.6-7.5 8.4-7.5 4.8 0 8.2 2.7 9.2 6.7', key: 'dome' }],
  ['path', { d: 'M11.8 5.7v1.8', key: 'button' }],
  ['path', { d: 'M3.4 15h12.1c2.7 0 5.5.6 5.7 1.9H3.4z', key: 'brim' }],
]);

export const PIECE_ICONS = {
  sneaker: SneakerIcon,
  shirt: ShirtIcon,
  hoodie: HoodieIcon,
  jacket: JacketIcon,
  pants: PantsIcon,
  shorts: ShortsIcon,
  glasses: GlassesIcon,
  cap: CapIcon,
  tag: TagIcon,
} satisfies Record<PieceIconName, LucideIcon>;
