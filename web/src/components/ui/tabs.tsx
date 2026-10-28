'use client';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cn } from 'cn';

// O gatilho não recebe className: o cn descartaria o text-body ao lado da cor do texto.

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" className={className} {...props} />;
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn('flex items-center gap-2', className)} {...props} />;
}

function TabsTrigger(props: Omit<TabsPrimitive.Tab.Props, 'className'>) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className="inline-flex h-ctl-lg shrink-0 items-center rounded-pill border border-paper-line bg-gray-0 px-4 text-body font-semibold whitespace-nowrap text-ink transition-colors duration-base hover:border-ink lg:h-ctl data-active:border-ink data-active:bg-ink data-active:text-gray-0"
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel data-slot="tabs-content" className={cn('animate-appear', className)} {...props} />;
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
