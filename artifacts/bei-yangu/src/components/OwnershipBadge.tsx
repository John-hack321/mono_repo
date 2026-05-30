import { cn, ownershipColor, ownershipLabel } from "@/lib/utils";

export function OwnershipBadge({
  ownership,
  className,
}: {
  ownership: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        ownershipColor(ownership),
        className
      )}
    >
      {ownershipLabel(ownership)}
    </span>
  );
}
