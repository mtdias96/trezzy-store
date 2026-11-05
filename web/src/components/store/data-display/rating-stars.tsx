import { StarIcon } from 'lucide-react';

type RatingStarsProps = {
  rating: number;
};

const STARS = [1, 2, 3, 4, 5];

export function RatingStars({ rating }: RatingStarsProps) {
  const filled = Math.round(rating);

  return (
    <span className="flex items-center gap-0.5">
      <span className="sr-only">{`Nota ${filled} de 5`}</span>
      {STARS.map((star) => (
        <StarIcon
          key={star}
          aria-hidden
          className={star <= filled ? 'size-3.5 fill-ink text-ink' : 'size-3.5 fill-paper-line text-paper-line'}
        />
      ))}
    </span>
  );
}
