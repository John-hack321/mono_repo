import { formatKes } from "@/lib/api";

export function PriceRange({
  min,
  max,
  currency = "KES",
  highlight = false,
}: {
  min: number;
  max: number;
  currency?: string;
  highlight?: boolean;
}) {
  const same = min === max;
  return (
    <p className={highlight ? "text-lg font-semibold text-teal-700" : "text-zinc-700"}>
      {same ? (
        formatKes(min)
      ) : (
        <>
          {formatKes(min)}
          <span className="mx-1 text-zinc-400">–</span>
          {formatKes(max)}
        </>
      )}
      {currency !== "KES" && <span className="ml-1 text-xs text-zinc-500">{currency}</span>}
    </p>
  );
}
