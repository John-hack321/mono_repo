import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Stethoscope, Shield } from "lucide-react";
import type { HospitalListItem } from "@/lib/types";
import { OwnershipBadge } from "./OwnershipBadge";
import { RatingStars } from "./RatingStars";
import { cn } from "@/lib/utils";

const TIER_COLORS: Record<string, string> = {
  "Level 6": "from-amber-400 to-orange-400",
  "Level 5": "from-teal-400 to-emerald-500",
  "Level 4": "from-blue-400 to-cyan-500",
};

const INITIALS_BG: Record<string, string> = {
  government: "from-sky-500 to-blue-600",
  private: "from-teal-500 to-emerald-600",
  "faith-based": "from-violet-500 to-purple-600",
};

function HospitalAvatar({ name, ownership }: { name: string; ownership: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const bg = INITIALS_BG[ownership] ?? "from-zinc-400 to-zinc-500";
  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-sm",
        bg
      )}
    >
      {initials}
    </div>
  );
}

export function HospitalCard({ hospital, index = 0 }: { hospital: HospitalListItem; index?: number }) {
  const tierGradient = TIER_COLORS[hospital.tier] ?? "from-zinc-400 to-zinc-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/hospitals/${hospital.slug}`}>
        <div className="group flex flex-col h-full rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer overflow-hidden">
          <div className={cn("h-1.5 bg-gradient-to-r", tierGradient)} />
          <div className="flex flex-col flex-1 p-5">
            <div className="flex items-start gap-3 mb-3">
              <HospitalAvatar name={hospital.name} ownership={hospital.ownership} />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-zinc-900 group-hover:text-teal-700 transition-colors leading-snug text-sm">
                  {hospital.name}
                </h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{hospital.location}, {hospital.county}</span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <RatingStars rating={hospital.rating} reviewCount={hospital.review_count} />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <OwnershipBadge ownership={hospital.ownership} />
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 font-medium">
                {hospital.tier}
              </span>
            </div>

            <div className="mt-auto flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-zinc-500">
                <Stethoscope className="h-3 w-3" />
                <span>{hospital.service_count} services listed</span>
              </div>
              {hospital.insurers.length > 0 && (
                <div className="flex items-center gap-1 text-teal-700">
                  <Shield className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">
                    {hospital.insurers.slice(0, 2).join(", ")}
                    {hospital.insurers.length > 2 ? ` +${hospital.insurers.length - 2}` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
