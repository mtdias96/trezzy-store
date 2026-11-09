'use client';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cn } from 'cn';

const triggerSize = {
  md: 'h-ctl-lg px-4 text-body lg:h-ctl',
  sm: 'h-ctl-lg px-3.5 text-body-sm lg:h-9.5',
};

type TabsTriggerProps = Omit<TabsPrimitive.Tab.Props, 'className'> & {
  size?: keyof typeof triggerSize;
};

// O gatilho não recebe className: o cn descartaria o text-body ao lado da cor do texto.

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" className={className} {...props} />;
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn('flex items-center gap-2', className)} {...props} />;
}

function TabsTrigger({ size = 'md', ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={`inline-flex shrink-0 items-center rounded-pill border border-line bg-gray-0 font-semibold whitespace-nowrap text-ink transition-colors duration-base hover:border-ink data-active:border-ink data-active:bg-ink data-active:text-gray-0 ${triggerSize[size]}`}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel data-slot="tabs-content" className={cn('animate-appear', className)} {...props} />;
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
