export function RatingStars({ rating, reviewCount }: { rating: number; reviewCount?: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <div className="flex text-amber-400" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < full || (i === full && half) ? "opacity-100" : "opacity-25"}>
            ★
          </span>
        ))}
      </div>
      <span className="font-medium text-zinc-800">{rating.toFixed(1)}</span>
      {reviewCount != null && reviewCount > 0 && (
        <span className="text-zinc-500">({reviewCount})</span>
      )}
    </div>
  );
}
