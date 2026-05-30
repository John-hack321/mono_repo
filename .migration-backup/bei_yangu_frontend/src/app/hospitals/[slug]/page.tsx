import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PriceRange } from "@/components/PriceRange";
import { RatingStars } from "@/components/RatingStars";
import { getHospital } from "@/lib/api";
import { ownershipColor, ownershipLabel } from "@/lib/utils";

export default async function HospitalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let hospital;
  try {
    hospital = await getHospital(slug);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/80 to-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href="/" className="text-sm font-medium text-teal-700 hover:underline">
          ← Back to hospitals
        </Link>

        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ownershipColor(hospital.ownership)}`}
              >
                {ownershipLabel(hospital.ownership)} · {hospital.tier}
              </span>
              <h1 className="mt-2 text-3xl font-bold text-zinc-900">{hospital.name}</h1>
              <p className="mt-1 text-zinc-600">
                {hospital.location}, {hospital.county}
              </p>
              <div className="mt-3">
                <RatingStars rating={hospital.rating} reviewCount={hospital.review_count} />
              </div>
            </div>
          </div>
          {hospital.description && (
            <p className="mt-6 leading-relaxed text-zinc-600">{hospital.description}</p>
          )}

          {hospital.equipment.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-zinc-800">Equipment</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {hospital.equipment.map((eq) => (
                  <span key={eq} className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hospital.insurers.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-zinc-800">Insurance accepted</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {hospital.insurers.map((ins) => (
                  <span
                    key={ins.slug}
                    className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800"
                  >
                    {ins.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-zinc-900">Services & price ranges</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Indicative ranges in KES — confirm with the hospital before treatment.
          </p>
          <ul className="mt-6 space-y-3">
            {hospital.services.map((svc) => (
              <li
                key={svc.id}
                className="flex flex-col justify-between gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-semibold text-zinc-900">{svc.procedure.name}</p>
                  <p className="text-xs text-zinc-500">{svc.procedure.category}</p>
                  {svc.notes && <p className="mt-1 text-sm text-zinc-500">{svc.notes}</p>}
                </div>
                <PriceRange min={svc.price_min} max={svc.price_max} highlight />
              </li>
            ))}
          </ul>
          {hospital.services.length === 0 && (
            <p className="mt-4 text-zinc-500">No services listed yet.</p>
          )}
        </section>

        <div className="mt-10 rounded-2xl bg-teal-600 px-6 py-5 text-white">
          <p className="font-semibold">Compare this hospital with others</p>
          <p className="mt-1 text-sm text-teal-100">
            Search by procedure to see ranked prices across Nairobi hospitals.
          </p>
          <Link
            href={`/search?q=${encodeURIComponent(hospital.services[0]?.procedure.name ?? "delivery")}`}
            className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-teal-800"
          >
            Compare prices
          </Link>
        </div>
      </main>
    </div>
  );
}
