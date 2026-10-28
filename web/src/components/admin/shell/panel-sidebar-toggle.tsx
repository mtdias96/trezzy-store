'use client';

import { ChevronLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

// Centralizado com my-auto, e não com translate: o Button desloca o translate ao ser pressionado.
export function PanelSidebarToggle() {
  const { open, toggleSidebar } = useSidebar();

  return (
    <Button
      variant="outline"
      size="icon-xs"
      aria-label={open ? 'Recolher o menu' : 'Expandir o menu'}
      onClick={toggleSidebar}
      className="absolute inset-y-0 -right-3 my-auto hidden rounded-pill border-gray-250 bg-card text-ink shadow-knob hover:bg-gray-100 md:inline-flex"
    >
      <ChevronLeftIcon aria-hidden className="transition-transform duration-base sidebar-collapsed:rotate-180" />
    </Button>
  );
}
