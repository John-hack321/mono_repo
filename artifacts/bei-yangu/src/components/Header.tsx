import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Heart } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/#hospitals", label: "Hospitals" },
    { href: "/#insurance", label: "Insurance" },
    { href: "/search?q=normal%20delivery", label: "Popular searches" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-teal-100/80 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-sm shadow-teal-500/25 group-hover:shadow-teal-500/40 transition-shadow">
            <Heart className="h-4 w-4 text-white fill-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-zinc-900 leading-none">Bei Yangu</p>
            <p className="text-[10px] text-teal-600 font-medium mt-0.5">Compare hospital prices · Kenya</p>
          </div>
        </Link>

        <nav className="hidden gap-1 sm:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {location !== "/search" && (
            <Link
              href="/search"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-500 hover:border-teal-300 hover:text-teal-700 transition-colors shadow-sm"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </Link>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden rounded-lg p-2 text-zinc-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-t border-teal-100 bg-white px-4 pb-4"
          >
            <nav className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/search"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white"
              >
                <Search className="h-4 w-4" />
                Search & Compare Prices
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
