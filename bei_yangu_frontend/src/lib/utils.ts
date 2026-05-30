import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    government: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
    private: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    "faith-based": "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
  };
  return map[ownership] ?? "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200";
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "…";
}
