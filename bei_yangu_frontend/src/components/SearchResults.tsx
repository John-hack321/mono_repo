"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { searchAI, searchServices } from "@/lib/api";
import type { AISearchResponse, SearchResponse } from "@/lib/types";
import { PriceRange } from "./PriceRange";
import { RatingStars } from "./RatingStars";
import { SearchBar } from "./SearchBar";

export function SearchResults({ query, useAI }: { query: string; useAI: boolean }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | AISearchResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const result = useAI ? await searchAI(query) : await searchServices(query);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setError("Could not load results. Is the API running on port 8000?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (query) run();
    return () => {
      cancelled = true;
    };
  }, [query, useAI]);

  const aiData = data && "ai_summary" in data ? data : null;
  const results = data?.results ?? [];
  const matched =
    data && "matched_procedures" in data
      ? data.matched_procedures
      : aiData?.suggested_procedures ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <SearchBar defaultQuery={query} />
      <div className="mt-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          Results for &ldquo;{query}&rdquo;
        </h1>
        {useAI && (
          <p className="mt-1 text-sm text-teal-700">Powered by Gemini AI + hospital catalogue</p>
        )}
      </div>

      {loading && (
        <div className="mt-12 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
        </div>
      )}

      {error && (
        <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-red-800">{error}</p>
      )}

      {!loading && aiData?.ai_summary && (
        <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50/50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">AI overview</p>
          <p className="mt-2 leading-relaxed text-zinc-700">{aiData.ai_summary}</p>
        </div>
      )}

      {!loading && matched.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {matched.map((p) => (
            <Link
              key={p.slug}
              href={`/search?q=${encodeURIComponent(p.name)}`}
              className="rounded-full bg-white px-3 py-1 text-sm ring-1 ring-teal-200 hover:bg-teal-50"
            >
              {p.name}
            </Link>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <p className="mt-8 text-zinc-600">
          No hospital listings matched. Try a procedure name like &ldquo;normal delivery&rdquo; or
          enable AI search for symptoms.
        </p>
      )}

      {!loading && results.length > 0 && (
        <ol className="mt-8 space-y-4">
          {results.map((item) => (
            <li
              key={`${item.hospital.slug}-${item.service.id}`}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-800">
                    #{item.rank}
                  </span>
                  <div>
                    <Link
                      href={`/hospitals/${item.hospital.slug}`}
                      className="text-lg font-semibold text-zinc-900 hover:text-teal-700"
                    >
                      {item.hospital.name}
                    </Link>
                    <p className="text-sm text-zinc-500">{item.hospital.location}</p>
                    <div className="mt-1">
                      <RatingStars
                        rating={item.hospital.rating}
                        reviewCount={item.hospital.review_count}
                      />
                    </div>
                    <p className="mt-2 font-medium text-zinc-800">{item.service.procedure.name}</p>
                    {item.service.notes && (
                      <p className="text-sm text-zinc-500">{item.service.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right sm:pl-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">From</p>
                  <PriceRange
                    min={item.service.price_min}
                    max={item.service.price_max}
                    highlight
                  />
                  <Link
                    href={`/hospitals/${item.hospital.slug}`}
                    className="mt-2 inline-block text-sm font-medium text-teal-700 hover:underline"
                  >
                    View all services →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
