import { formatKes } from "@/lib/api";
import { cn } from "@/lib/utils";

export function PriceRange({
  min,
  max,
  currency = "KES",
  highlight = false,
  size = "md",
}: {
  min: number;
  max: number;
  currency?: string;
  highlight?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const same = min === max;
  const textClass = cn(
    highlight ? "text-teal-700 font-bold" : "text-zinc-700 font-semibold",
    size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base"
  );

  return (
    <div>
      <p className={textClass}>
        {same ? (
          formatKes(min)
        ) : (
          <>
            {formatKes(min)}
            <span className="mx-1 text-zinc-400 font-normal">–</span>
            {formatKes(max)}
          </>
        )}
        {currency !== "KES" && (
          <span className="ml-1 text-xs text-zinc-500 font-normal">{currency}</span>
        )}
      </p>
      {highlight && (
        <div className="mt-1.5 h-1 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
            style={{ width: `${Math.min(100, (min / 500000) * 100 + 20)}%` }}
          />
        </div>
      )}
    </div>
  );
}
