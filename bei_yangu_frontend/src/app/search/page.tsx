import { Header } from "@/components/Header";
import { SearchResults } from "@/components/SearchResults";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ai?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const useAI = params.ai === "1";

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/80 to-white">
      <Header />
      {!query ? (
        <p className="mx-auto max-w-6xl px-4 py-16 text-center text-zinc-600">
          Enter a procedure or describe your symptoms to compare hospital prices.
        </p>
      ) : (
        <SearchResults query={query} useAI={useAI} />
      )}
    </div>
  );
}
