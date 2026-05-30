import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  reviewCount,
  size = "sm",
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const starSize = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < full
                ? "fill-amber-400 text-amber-400"
                : i === full && half
                ? "fill-amber-200 text-amber-400"
                : "fill-zinc-200 text-zinc-200"
            )}
          />
        ))}
      </div>
      <span className={cn("font-semibold text-zinc-800", size === "md" ? "text-sm" : "text-xs")}>
        {rating.toFixed(1)}
      </span>
      {reviewCount != null && reviewCount > 0 && (
        <span className={cn("text-zinc-500", size === "md" ? "text-sm" : "text-xs")}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
