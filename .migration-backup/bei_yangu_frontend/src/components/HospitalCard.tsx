import Link from "next/link";
import type { HospitalListItem } from "@/lib/types";
import { ownershipColor, ownershipLabel } from "@/lib/utils";
import { RatingStars } from "./RatingStars";

export function HospitalCard({ hospital }: { hospital: HospitalListItem }) {
  return (
    <Link
      href={`/hospitals/${hospital.slug}`}
      className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-zinc-900 group-hover:text-teal-700">{hospital.name}</h3>
          <p className="mt-0.5 text-sm text-zinc-500">{hospital.location}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${ownershipColor(hospital.ownership)}`}
        >
          {ownershipLabel(hospital.ownership)}
        </span>
      </div>
      <RatingStars rating={hospital.rating} reviewCount={hospital.review_count} />
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
        <span className="rounded-md bg-zinc-100 px-2 py-0.5">{hospital.tier}</span>
        <span>{hospital.service_count} services listed</span>
      </div>
      {hospital.insurers.length > 0 && (
        <p className="mt-3 line-clamp-1 text-xs text-teal-700">
          Accepts: {hospital.insurers.slice(0, 3).join(", ")}
          {hospital.insurers.length > 3 ? "…" : ""}
        </p>
      )}
    </Link>
  );
}
