import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Stethoscope,
  Shield,
  Cpu,
  Star,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { getHospital } from "@/lib/api";
import type { HospitalDetail as THospitalDetail } from "@/lib/types";
import { Header } from "@/components/Header";
import { RatingStars } from "@/components/RatingStars";
import { PriceRange } from "@/components/PriceRange";
import { OwnershipBadge } from "@/components/OwnershipBadge";
import { SearchBar } from "@/components/SearchBar";
import { tierColor } from "@/lib/utils";

function HospitalDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gradient-to-br from-zinc-200 to-zinc-100 rounded-3xl mb-6" />
      <div className="space-y-3">
        <div className="h-8 bg-zinc-200 rounded-lg w-2/3" />
        <div className="h-4 bg-zinc-100 rounded-lg w-1/3" />
        <div className="h-4 bg-zinc-100 rounded-lg w-1/4" />
      </div>
      <div className="mt-8 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-zinc-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

const OWNERSHIP_GRADIENTS: Record<string, string> = {
  government: "from-sky-600 to-blue-700",
  private: "from-teal-600 to-emerald-700",
  "faith-based": "from-violet-600 to-purple-700",
};

export default function HospitalDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [hospital, setHospital] = useState<THospitalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getHospital(slug)
      .then(setHospital)
      .catch(() => setError("Hospital not found or API is not running."))
      .finally(() => setLoading(false));
  }, [slug]);

  const gradient =
    OWNERSHIP_GRADIENTS[hospital?.ownership ?? "private"] ??
    "from-teal-600 to-emerald-700";

  const filteredServices = hospital?.services.filter((s) =>
    searchQuery
      ? s.procedure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.procedure.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href="/">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-teal-700 transition-colors cursor-pointer mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to hospitals
          </span>
        </Link>

        {loading && <HospitalDetailSkeleton />}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold text-red-800">Error loading hospital</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {hospital && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-8 text-white shadow-xl mb-8`}>
              <div className="absolute top-0 right-0 opacity-10">
                <div className="h-48 w-48 rounded-full bg-white translate-x-16 -translate-y-12" />
              </div>
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <OwnershipBadge
                    ownership={hospital.ownership}
                    className="bg-white/20 text-white ring-white/30 backdrop-blur-sm"
                  />
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/20 text-white ring-1 ring-white/30`}
                  >
                    {hospital.tier}
                  </span>
                </div>
                <h1 className="text-2xl font-bold sm:text-3xl leading-tight">{hospital.name}</h1>
                <div className="mt-2 flex items-center gap-1.5 text-white/80 text-sm">
                  <MapPin className="h-4 w-4" />
                  {hospital.location}, {hospital.county}
                </div>
                <div className="mt-3">
                  <RatingStars rating={hospital.rating} reviewCount={hospital.review_count} size="md" />
                </div>
                {hospital.description && (
                  <p className="mt-4 text-white/85 text-sm leading-relaxed max-w-2xl">
                    {hospital.description}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{hospital.services.length}</p>
                  <p className="text-xs text-zinc-500">Services listed</p>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                  <Shield className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{hospital.insurers.length}</p>
                  <p className="text-xs text-zinc-500">Insurance accepted</p>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{hospital.rating.toFixed(1)}</p>
                  <p className="text-xs text-zinc-500">Rating score</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-zinc-900">Services & Prices</h2>
                  <p className="text-xs text-zinc-400">Indicative ranges in KES</p>
                </div>

                <div className="mb-4">
                  <input
                    type="search"
                    placeholder="Filter services…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="space-y-3">
                  {filteredServices?.map((svc, i) => (
                    <motion.div
                      key={svc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex flex-col justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 hover:border-teal-200 transition-colors sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 text-sm">{svc.procedure.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{svc.procedure.category}</p>
                        {svc.notes && (
                          <p className="text-xs text-zinc-500 mt-1">{svc.notes}</p>
                        )}
                      </div>
                      <div className="sm:shrink-0 sm:text-right">
                        <PriceRange min={svc.price_min} max={svc.price_max} highlight size="sm" />
                        <Link href={`/search?q=${encodeURIComponent(svc.procedure.name)}`}>
                          <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 cursor-pointer">
                            Compare prices
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                  {filteredServices?.length === 0 && (
                    <p className="py-8 text-center text-sm text-zinc-400">No services match your filter.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {hospital.insurers.length > 0 && (
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-violet-600" />
                      <h3 className="font-semibold text-zinc-900 text-sm">Insurance accepted</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hospital.insurers.map((ins) => (
                        <span
                          key={ins.slug}
                          className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
                        >
                          {ins.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hospital.equipment.length > 0 && (
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Cpu className="h-4 w-4 text-sky-600" />
                      <h3 className="font-semibold text-zinc-900 text-sm">Equipment available</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hospital.equipment.map((eq) => (
                        <span
                          key={eq}
                          className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-5 text-white">
                  <p className="font-semibold text-sm mb-1">Compare with other hospitals</p>
                  <p className="text-xs text-teal-100 mb-4">
                    Find the best price for this hospital's services across all of Kenya.
                  </p>
                  <Link
                    href={`/search?q=${encodeURIComponent(
                      hospital.services[0]?.procedure.name ?? "hospital services"
                    )}&ai=1`}
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50 cursor-pointer transition-colors">
                      Compare prices
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
