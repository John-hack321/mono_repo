import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SearchBar({
  defaultQuery = "",
  large = false,
  onSearch,
}: {
  defaultQuery?: string;
  large?: boolean;
  onSearch?: (query: string, aiMode: boolean) => void;
}) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState(defaultQuery);
  const [aiMode, setAiMode] = useState(true);
  const [focused, setFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (onSearch) {
      onSearch(q, aiMode);
    } else {
      const params = new URLSearchParams({ q });
      if (aiMode) params.set("ai", "1");
      navigate(`/search?${params}`);
    }
  }

  const exampleQueries = [
    "normal delivery",
    "appendectomy",
    "sharp pain lower abdomen",
    "MRI scan",
    "testicular exploration",
  ];

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <motion.div
          animate={{
            boxShadow: focused
              ? "0 0 0 3px rgba(13,148,136,0.12), 0 8px 20px -4px rgba(13,148,136,0.15)"
              : "0 2px 8px -2px rgba(0,0,0,0.08)",
          }}
          className={cn(
            "flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-2 sm:flex-row",
            focused && "border-teal-300",
            large ? "sm:p-2.5" : ""
          )}
        >
          <div className="relative flex min-w-0 flex-1 items-center gap-2 px-2">
            <Search className={cn("shrink-0 text-zinc-400", large ? "h-5 w-5" : "h-4 w-4")} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={
                large
                  ? "Search by symptom, procedure, or condition…"
                  : "e.g. normal delivery, MRI scan, chest pain…"
              }
              className={cn(
                "min-w-0 flex-1 border-0 bg-transparent text-zinc-900 placeholder:text-zinc-400 focus:outline-none",
                large ? "py-3 text-base" : "py-2 text-sm"
              )}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="shrink-0 rounded-full p-0.5 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAiMode(!aiMode)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                aiMode
                  ? "border-teal-200 bg-teal-50 text-teal-700"
                  : "border-zinc-200 bg-zinc-50 text-zinc-500"
              )}
            >
              <Sparkles className={cn("h-3.5 w-3.5", aiMode ? "text-teal-600" : "text-zinc-400")} />
              AI search
            </button>
            <button
              type="submit"
              disabled={!query.trim()}
              className={cn(
                "flex items-center gap-2 rounded-xl bg-teal-600 font-semibold text-white transition-all hover:bg-teal-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                large ? "px-6 py-3 text-sm" : "px-4 py-2 text-sm"
              )}
            >
              <Search className="h-4 w-4" />
              Compare prices
            </button>
          </div>
        </motion.div>
      </form>

      {large && !query && (
        <div className="mt-3 flex flex-wrap gap-2">
          {exampleQueries.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuery(q)}
              className="rounded-full border border-teal-200 bg-white px-3 py-1 text-xs text-teal-700 hover:bg-teal-50 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
