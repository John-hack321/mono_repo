import Link from "next/link";
import { Header } from "@/components/Header";
import { HospitalCard } from "@/components/HospitalCard";
import { SearchBar } from "@/components/SearchBar";
import { getHome, getHospitals } from "@/lib/api";

export default async function HomePage() {
  let home;
  let allHospitals;
  try {
    [home, allHospitals] = await Promise.all([getHome(), getHospitals()]);
  } catch {
    return (
      <div className="min-h-screen bg-teal-50">
        <Header />
        <main className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="text-xl font-bold text-zinc-900">API not reachable</h1>
          <p className="mt-2 text-zinc-600">
            Start PostgreSQL (Docker), then run the FastAPI backend on port 8000.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-left text-xs text-teal-300">
            cd bei_yangu_backend && uvicorn app.main:app --reload
          </pre>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <Header />

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">
            Healthcare price transparency · Kenya
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Know the price before you go to hospital
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            Compare procedure costs across hospitals, filter by insurance, and use AI search when
            you only have symptoms — not a medical name.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <SearchBar large />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm">
          {home.popular_procedures.slice(0, 5).map((p) => (
            <Link
              key={p.slug}
              href={`/search?q=${encodeURIComponent(p.name)}`}
              className="rounded-full bg-white px-3 py-1.5 text-teal-800 ring-1 ring-teal-200 hover:bg-teal-50"
            >
              {p.name}
            </Link>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 rounded-2xl border border-teal-100 bg-white/80 p-6 text-center shadow-sm">
          <div>
            <p className="text-3xl font-bold text-teal-700">{home.stats.hospitals}</p>
            <p className="text-sm text-zinc-500">Hospitals</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-teal-700">{home.stats.procedures}</p>
            <p className="text-sm text-zinc-500">Procedures</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-teal-700">{home.stats.insurers}</p>
            <p className="text-sm text-zinc-500">Insurers</p>
          </div>
        </div>
      </section>

      <section id="hospitals" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Hospitals</h2>
            <p className="mt-1 text-zinc-600">Government, private, and faith-based facilities</p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {allHospitals.map((h) => (
            <HospitalCard key={h.slug} hospital={h} />
          ))}
        </div>
      </section>

      <section id="insurance" className="border-t border-teal-100 bg-teal-50/50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-zinc-900">Insurance partners</h2>
          <p className="mt-1 text-zinc-600">NHIF, Jubilee, AAR, and more accepted at listed hospitals</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {home.top_insurers.map((ins) => (
              <li
                key={ins.slug}
                className="rounded-2xl border border-white bg-white px-5 py-4 shadow-sm"
              >
                <p className="font-semibold text-zinc-900">{ins.name}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {ins.hospital_count} hospital{ins.hospital_count === 1 ? "" : "s"} on platform
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
        Bei Yangu — compare healthcare prices in Kenya. Not medical advice.
      </footer>
    </div>
  );
}
