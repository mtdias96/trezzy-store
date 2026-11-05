import { PageContainer } from '@/components/store/layout/page-container';

export function ProductDetailSkeleton() {
  return (
    <PageContainer role="status" className="pt-4 pb-16 lg:pt-6">
      <span className="sr-only">Carregando produto…</span>
      <div className="h-5 w-1/3 animate-skeleton rounded-md bg-paper-stone" />
      <div className="mt-4 grid gap-6 lg:mt-6 lg:grid-cols-12 lg:gap-10">
        <div className="aspect-4/5 animate-skeleton rounded-block bg-paper-stone lg:col-span-7 lg:ml-24" />
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="h-4 w-24 animate-skeleton rounded-md bg-paper-stone" />
          <div className="h-ctl w-3/4 animate-skeleton rounded-md bg-paper-stone" />
          <div className="h-ctl w-1/3 animate-skeleton rounded-md bg-paper-stone" />
          <div className="h-field animate-skeleton rounded-2xl bg-paper-stone" />
          <div className="h-cta animate-skeleton rounded-pill bg-paper-stone" />
        </div>
      </div>
    </PageContainer>
  );
}
