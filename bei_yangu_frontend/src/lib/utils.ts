export function ownershipLabel(ownership: string): string {
  const map: Record<string, string> = {
    government: "Government",
    private: "Private",
    "faith-based": "Faith-based",
  };
  return map[ownership] ?? ownership;
}

export function ownershipColor(ownership: string): string {
  const map: Record<string, string> = {
    government: "bg-sky-100 text-sky-800",
    private: "bg-emerald-100 text-emerald-800",
    "faith-based": "bg-violet-100 text-violet-800",
  };
  return map[ownership] ?? "bg-zinc-100 text-zinc-700";
}
