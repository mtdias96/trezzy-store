import { ReviewList } from '@/features/store/catalog/components/reviews/review-list';
import { getRecentReviews } from '@/features/store/catalog/data/queries';

type ReviewListContainerProps = {
  slug: string;
};

export async function ReviewListContainer({ slug }: ReviewListContainerProps) {
  const reviews = await getRecentReviews(slug);

  return reviews.length > 0 ? <ReviewList reviews={reviews} /> : null;
}
