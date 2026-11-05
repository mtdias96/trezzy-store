import type { ReactNode } from 'react';

type DashboardViewProps = {
  children: ReactNode;
};

export function DashboardView({ children }: DashboardViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8">
      <h1 className="type-display text-display-lg">Visão geral</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </div>
  );
}
