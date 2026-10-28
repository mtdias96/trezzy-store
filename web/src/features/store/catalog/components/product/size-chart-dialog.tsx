import type { ReactNode } from 'react';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type SizeChartDialogProps = {
  children: ReactNode;
};

export function SizeChartDialog({ children }: SizeChartDialogProps) {
  return (
    <Dialog>
      <DialogTrigger className="text-body-sm font-semibold text-ink underline underline-offset-2 hover:text-brand">
        Tabela de medidas
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogTitle className="type-display">
          <span className="text-display-sm">Tabela de medidas</span>
        </DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
