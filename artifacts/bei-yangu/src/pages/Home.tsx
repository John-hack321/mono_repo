import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Shield,
  Stethoscope,
  Search,
  Sparkles,
  ChevronRight,
  TrendingDown,
  MapPin,
} from "lucide-react";
import { getHome, getHospitals } from "@/lib/api";
import type { HomeResponse, HospitalListItem } from "@/lib/types";
import { Header } from "@/components/Header";
import { HospitalCard } from "@/components/HospitalCard";
import { SearchBar } from "@/components/SearchBar";
import { SkeletonCard } from "@/components/SkeletonCard";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || target === 0) return;
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + increment, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Search,
    title: "Search by symptom or procedure",
    desc: "Type what you need — a medical name or just describe your symptoms. Our AI maps it to real procedures.",
    color: "from-teal-500 to-emerald-600",
  },
  {
    step: "02",
    icon: TrendingDown,
    title: "Compare prices across hospitals",
    desc: "See price ranges from government, private, and faith-based facilities ranked from lowest to highest.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    step: "03",
    icon: Building2,
    title: "Visit the right hospital",
    desc: "Pick the best option for your budget, location, and insurance — before you step through the door.",
    color: "from-violet-500 to-purple-600",
  },
];

const OWNERSHIP_FILTERS = [
  { label: "All hospitals", value: "" },
  { label: "Government", value: "government" },
  { label: "Private", value: "private" },
  { label: "Faith-based", value: "faith-based" },
];

export default function Home() {
  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [hospitals, setHospitals] = useState<HospitalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownershipFilter, setOwnershipFilter] = useState("");
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    Promise.all([getHome(), getHospitals()])
      .then(([home, all]) => {
        setHomeData(home);
        setHospitals(all);
      })
      .catch(() => setApiError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (ownershipFilter === "") {
      getHospitals().then(setHospitals).catch(() => {});
    } else {
      getHospitals({ ownership: ownershipFilter }).then(setHospitals).catch(() => {});
    }
  }, [ownershipFilter]);

  const displayedHospitals = hospitals.slice(0, 12);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(13,148,136,0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(5,150,105,0.06),transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-1.5 text-xs font-semibold text-teal-700 shadow-sm mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered healthcare price comparison · Kenya
            </motion.div>

            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl leading-[1.1]">
              Know the{" "}
              <span className="text-gradient">price before</span>
              <br />
              you go to hospital
            </h1>

            <p className="mt-5 text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Compare procedure costs across Kenya's hospitals. Search by symptom when you
              don't know the medical name — our AI finds what you need.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mx-auto mt-10 max-w-2xl"
          >
            <SearchBar large />
          </motion.div>

          {apiError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto mt-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
            >
              <p className="font-semibold">Backend not running</p>
              <p className="mt-1">
                Start the FastAPI backend:{" "}
                <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-mono">
                  cd bei_yangu_backend && uvicorn app.main:app --reload
                </code>
              </p>
            </motion.div>
          )}

          {homeData && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4 rounded-2xl border border-teal-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm"
            >
              {[
                { value: homeData.stats.hospitals, label: "Hospitals", icon: Building2 },
                { value: homeData.stats.procedures, label: "Procedures", icon: Stethoscope },
                { value: homeData.stats.insurers, label: "Insurers", icon: Shield },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-teal-700 sm:text-3xl">
                    <AnimatedCounter target={value} />
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 font-medium">{label}</p>
                </div>
              ))}
            </motion.div>
          )}

          {homeData && homeData.popular_procedures.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mx-auto mt-6 flex flex-wrap justify-center gap-2"
            >
              <span className="text-xs text-zinc-400 self-center">Popular:</span>
              {homeData.popular_procedures.slice(0, 6).map((p) => (
                <Link
                  key={p.slug}
                  href={`/search?q=${encodeURIComponent(p.name)}`}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 hover:border-teal-300 hover:text-teal-700 transition-colors shadow-sm"
                >
                  {p.name}
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">How it works</h2>
            <p className="mt-3 text-zinc-500">Three steps to find the best price for your care</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-zinc-200 bg-white p-6 hover:border-teal-200 hover:shadow-md transition-all"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-sm`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="absolute top-4 right-5 text-xs font-bold text-zinc-200">
                  {step}
                </span>
                <h3 className="font-semibold text-zinc-900 mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="hospitals" className="border-t border-zinc-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Hospitals</h2>
              <p className="mt-1 text-zinc-500 text-sm">
                Government, private, and faith-based facilities across Kenya
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {OWNERSHIP_FILTERS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setOwnershipFilter(value)}
                  className={`rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all ${
                    ownershipFilter === value
                      ? "bg-teal-600 text-white shadow-sm"
                      : "border border-zinc-200 bg-white text-zinc-600 hover:border-teal-300 hover:text-teal-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : displayedHospitals.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedHospitals.map((h, i) => (
                  <HospitalCard key={h.slug} hospital={h} index={i} />
                ))}
              </div>
              {hospitals.length > 12 && (
                <div className="mt-8 text-center">
                  <Link href="/search">
                    <span className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:border-teal-300 hover:text-teal-700 transition-colors cursor-pointer">
                      View all {hospitals.length} hospitals
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-zinc-500">
              <p>No hospitals found for this filter.</p>
            </div>
          )}
        </div>
      </section>

      {homeData && homeData.top_insurers.length > 0 && (
        <section
          id="insurance"
          className="border-t border-zinc-100 bg-gradient-to-br from-teal-50/60 to-emerald-50/40 py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Insurance partners</h2>
              <p className="mt-3 text-zinc-500 text-sm">
                Major health insurers accepted across listed hospitals
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {homeData.top_insurers.map((ins, i) => (
                <motion.div
                  key={ins.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 rounded-2xl border border-white bg-white px-5 py-4 shadow-sm hover:border-teal-200 hover:shadow-md transition-all"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                    <Shield className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">{ins.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {ins.hospital_count} hospital{ins.hospital_count === 1 ? "" : "s"} on platform
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-zinc-100 bg-gradient-to-br from-teal-600 to-emerald-700 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Search
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Don't know the procedure name?
            </h2>
            <p className="mt-4 text-teal-100 text-lg">
              Just describe your symptoms. Our AI maps them to real procedures and finds
              you the best prices — just like having a medical-savvy friend on call.
            </p>
            <Link href="/search?ai=1">
              <span className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-teal-800 hover:bg-teal-50 cursor-pointer transition-colors shadow-lg shadow-teal-900/20">
                Try AI search
                <Sparkles className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-zinc-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-zinc-900">Bei Yangu</p>
              <p className="text-xs text-zinc-500 mt-1">
                Healthcare price transparency for Kenya. Not medical advice.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <MapPin className="h-3 w-3" />
              Built for Kenya 🇰🇪
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
