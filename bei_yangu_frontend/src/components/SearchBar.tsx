"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({
  defaultQuery = "",
  large = false,
}: {
  defaultQuery?: string;
  large?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [aiMode, setAiMode] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const params = new URLSearchParams({ q });
    if (aiMode) params.set("ai", "1");
    router.push(`/search?${params}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`flex flex-col gap-2 rounded-2xl border border-teal-200 bg-white p-2 shadow-lg shadow-teal-900/5 sm:flex-row ${
          large ? "sm:p-2.5" : ""
        }`}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. normal delivery, testicular exploration, sharp pain lower abdomen..."
          className={`min-w-0 flex-1 rounded-xl border-0 bg-transparent px-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
            large ? "py-3.5 text-base" : "py-2.5 text-sm"
          }`}
        />
        <div className="flex gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 text-xs text-zinc-600">
            <input
              type="checkbox"
              checked={aiMode}
              onChange={(e) => setAiMode(e.target.checked)}
              className="rounded border-teal-300 text-teal-600 focus:ring-teal-500"
            />
            AI search
          </label>
          <button
            type="submit"
            className={`rounded-xl bg-teal-600 px-5 font-semibold text-white transition hover:bg-teal-700 ${
              large ? "py-3.5" : "py-2.5"
            }`}
          >
            Compare prices
          </button>
        </div>
      </div>
    </form>
  );
}
