import { useSearch } from "wouter";
import { Header } from "@/components/Header";
import { SearchResults } from "@/components/SearchResults";
import { SearchBar } from "@/components/SearchBar";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const query = params.get("q")?.trim() ?? "";
  const useAI = params.get("ai") === "1";

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-white">
      <Header />
      {!query ? (
        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 mb-4">
              <SearchIcon className="h-8 w-8 text-teal-600" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900">Compare hospital prices</h1>
            <p className="mt-3 text-zinc-500">
              Search by procedure name, symptom, or condition to compare prices across Kenya's hospitals.
            </p>
          </div>
          <SearchBar large />
        </main>
      ) : (
        <SearchResults query={query} useAI={useAI} />
      )}
    </div>
  );
}
