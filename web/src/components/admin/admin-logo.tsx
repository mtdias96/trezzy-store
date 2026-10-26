import { cn } from '@/lib/utils';

type AdminLogoSize = 'md' | 'lg';

type AdminLogoProps = {
  size?: AdminLogoSize;
  className?: string;
};

// O selo fica fora do cn: ele não conhece os tokens e descartaria o text-seal/text-micro ao lado do text-gray-0.
const sizeClass = {
  md: {
    root: 'gap-2',
    wordmark: 'type-display text-display-md',
    seal: 'rotate-sticker rounded-pill bg-brand px-1.75 py-1 text-seal font-extrabold text-gray-0 uppercase',
  },
  lg: {
    root: 'gap-2.5',
    wordmark: 'type-display text-display-lg',
    seal: 'rotate-sticker rounded-pill bg-brand px-2 py-1 text-micro font-extrabold text-gray-0 uppercase',
  },
} satisfies Record<AdminLogoSize, Record<'root' | 'wordmark' | 'seal', string>>;

export function AdminLogo({ size = 'md', className }: AdminLogoProps) {
  const classes = sizeClass[size];

  return (
    <span className={cn('inline-flex items-center', classes.root, className)}>
      <span className={classes.wordmark}>Trezzy</span>
      <span className={classes.seal}>Admin</span>
    </span>
  );
}
