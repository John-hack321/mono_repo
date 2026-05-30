import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-100 text-4xl mb-6">
          🏥
        </div>
        <h1 className="text-3xl font-bold text-zinc-900">Page not found</h1>
        <p className="mt-3 text-zinc-500">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 font-semibold text-zinc-700 hover:border-teal-300 hover:text-teal-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search hospitals
          </Link>
        </div>
      </main>
    </div>
  );
}
