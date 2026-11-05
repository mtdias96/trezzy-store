import { FIT_OPTIONS, fitLabel } from '@/features/store/catalog/model/reviews';
import type { FitResult } from '@/features/store/catalog/model/types';

type FitScaleProps = {
  fit: FitResult;
};

const LABEL_ALIGN = ['text-left', 'text-center', 'text-right'];

export function FitScale({ fit }: FitScaleProps) {
  return (
    <div>
      <p className="text-body-sm font-bold text-ink">
        Caimento
        <span className="sr-only">{`: ${fitLabel(fit)}`}</span>
      </p>
      <div aria-hidden className="mt-2 grid grid-cols-3 gap-1">
        {FIT_OPTIONS.map(({ value, label }, index) => (
          <div key={value} className="flex flex-col gap-1.5">
            <span className={value === fit ? 'h-1.5 rounded-pill bg-brand' : 'h-1.5 rounded-pill bg-paper-stone'} />
            <span className={`text-caption ${LABEL_ALIGN[index] ?? ''} ${value === fit ? 'font-bold text-ink' : 'text-gray-700'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
