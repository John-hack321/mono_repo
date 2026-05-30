import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingDown, AlertCircle, ArrowRight } from "lucide-react";
import { searchAI, searchServices } from "@/lib/api";
import type { AISearchResponse, SearchResponse } from "@/lib/types";
import { PriceRange } from "./PriceRange";
import { RatingStars } from "./RatingStars";
import { SearchBar } from "./SearchBar";
import { SkeletonResultItem } from "./SkeletonCard";
import { OwnershipBadge } from "./OwnershipBadge";

function RankBadge({ rank }: { rank: number }) {
  const colors =
    rank === 1
      ? "bg-amber-100 text-amber-700 ring-amber-200"
      : rank === 2
      ? "bg-zinc-100 text-zinc-600 ring-zinc-200"
      : rank === 3
      ? "bg-orange-100 text-orange-700 ring-orange-200"
      : "bg-teal-50 text-teal-700 ring-teal-200";

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 text-sm font-bold ${colors}`}
    >
      #{rank}
    </div>
  );
}

export function SearchResults({
  query,
  useAI,
}: {
  query: string;
  useAI: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | AISearchResponse | null>(null);
  const [currentQuery, setCurrentQuery] = useState(query);
  const [currentAI, setCurrentAI] = useState(useAI);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const result = currentAI
          ? await searchAI(currentQuery)
          : await searchServices(currentQuery);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled)
          setError("Could not reach the API. Make sure the FastAPI backend is running on port 8000.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (currentQuery) run();
    return () => { cancelled = true; };
  }, [currentQuery, currentAI]);

  function handleSearch(q: string, ai: boolean) {
    setCurrentQuery(q);
    setCurrentAI(ai);
    window.history.pushState({}, "", `/search?q=${encodeURIComponent(q)}${ai ? "&ai=1" : ""}`);
  }

  const aiData = data && "ai_summary" in data ? data : null;
  const results = data?.results ?? [];
  const matched =
    data && "matched_procedures" in data
      ? data.matched_procedures
      : aiData?.suggested_procedures ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <SearchBar defaultQuery={currentQuery} onSearch={handleSearch} />

      <div className="mt-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Results for &ldquo;{currentQuery}&rdquo;
          </h1>
          {currentAI ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-teal-600">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by Gemini AI + hospital catalogue
            </p>
          ) : (
            <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
              <TrendingDown className="h-3.5 w-3.5" />
              Ranked from lowest to highest price
            </p>
          )}
        </div>
        {!loading && data && (
          <div className="shrink-0 rounded-xl bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {loading && (
        <div className="mt-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonResultItem key={i} />
          ))}
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="font-semibold text-red-800">Could not load results</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      {!loading && aiData?.ai_summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50/50 p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">AI Overview</p>
          </div>
          <p className="leading-relaxed text-zinc-700 text-sm">{aiData.ai_summary}</p>
        </motion.div>
      )}

      {!loading && matched.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-zinc-500 self-center">Matched procedures:</span>
          {matched.map((p) => (
            <button
              key={p.slug}
              onClick={() => handleSearch(p.name, currentAI)}
              className="rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-3xl mb-4">
            🔍
          </div>
          <p className="text-lg font-semibold text-zinc-800">No results found</p>
          <p className="mt-2 text-sm text-zinc-500">
            Try enabling AI search to match symptoms to procedures, or search for a procedure
            name like &ldquo;normal delivery&rdquo; or &ldquo;appendectomy&rdquo;.
          </p>
        </motion.div>
      )}

      {!loading && results.length > 0 && (
        <AnimatePresence>
          <ol className="mt-6 space-y-4">
            {results.map((item, i) => (
              <motion.li
                key={`${item.hospital.slug}-${item.service.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-teal-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <RankBadge rank={item.rank} />
                    <div className="min-w-0">
                      <Link href={`/hospitals/${item.hospital.slug}`}>
                        <span className="text-base font-semibold text-zinc-900 hover:text-teal-700 transition-colors cursor-pointer">
                          {item.hospital.name}
                        </span>
                      </Link>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.hospital.location}, {item.hospital.county}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <RatingStars rating={item.hospital.rating} reviewCount={item.hospital.review_count} />
                        <OwnershipBadge ownership={item.hospital.ownership} />
                      </div>
                      <p className="mt-2 font-medium text-zinc-800 text-sm">
                        {item.service.procedure.name}
                      </p>
                      {item.service.notes && (
                        <p className="text-xs text-zinc-400 mt-0.5">{item.service.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="sm:text-right sm:pl-4 sm:shrink-0">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">Price range</p>
                    <PriceRange
                      min={item.service.price_min}
                      max={item.service.price_max}
                      highlight
                      size="md"
                    />
                    <Link href={`/hospitals/${item.hospital.slug}`}>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800 cursor-pointer transition-colors">
                        View all services
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </AnimatePresence>
      )}
    </div>
  );
}
