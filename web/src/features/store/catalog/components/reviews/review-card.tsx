import { RelativeDate } from '@/components/common/data-display/relative-date';
import { RatingStars } from '@/components/store/data-display/rating-stars';
import type { ProductReview } from '@/features/store/catalog/model/types';

type ReviewCardProps = {
  review: ProductReview;
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-paper-line p-4">
      <div className="flex items-center justify-between gap-3">
        <RatingStars rating={review.rating} />
        <p className="text-caption text-gray-700">
          <RelativeDate date={review.createdAt} />
        </p>
      </div>
      <h3 className="mt-3 text-body font-bold text-ink">{review.title}</h3>
      <p className="mt-2 text-body-sm text-gray-800">{review.body}</p>
      <div className="mt-auto pt-4">
        {review.size || review.verified
          ? (
              <ul className="flex flex-wrap gap-1.5">
                {review.size ? <li className="rounded-pill bg-paper-stone px-2 py-0.5 text-caption font-semibold text-ink">{`Comprou ${review.size}`}</li> : null}
                {review.verified ? <li className="rounded-pill bg-success-50 px-2 py-0.5 text-caption font-semibold text-success-700">Compra verificada</li> : null}
              </ul>
            )
          : null}
        <p className="mt-3 text-caption text-gray-700">
          <span className="font-bold text-ink">{review.author}</span>
          {review.location ? ` · ${review.location}` : null}
        </p>
      </div>
    </article>
  );
}
