import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-teal-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-lg font-bold text-white">
            BY
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-zinc-900">Bei Yangu</p>
            <p className="text-xs text-teal-700">Compare hospital prices in Kenya</p>
          </div>
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-zinc-600 sm:flex">
          <Link href="/#hospitals" className="hover:text-teal-700">
            Hospitals
          </Link>
          <Link href="/#insurance" className="hover:text-teal-700">
            Insurance
          </Link>
          <Link href="/search?q=normal%20delivery" className="hover:text-teal-700">
            Popular searches
          </Link>
        </nav>
      </div>
    </header>
  );
}
