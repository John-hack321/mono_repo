import type {
  AISearchResponse,
  HomeResponse,
  HospitalDetail,
  HospitalListItem,
  InsuranceItem,
  ProcedureBrief,
  SearchResponse,
} from "./types";

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export function getHome(): Promise<HomeResponse> {
  return fetchJson("/api/home");
}

export function getHospitals(params?: {
  ownership?: string;
  county?: string;
}): Promise<HospitalListItem[]> {
  const q = new URLSearchParams();
  if (params?.ownership) q.set("ownership", params.ownership);
  if (params?.county) q.set("county", params.county);
  const qs = q.toString();
  return fetchJson(`/api/hospitals${qs ? `?${qs}` : ""}`);
}

export function getHospital(slug: string): Promise<HospitalDetail> {
  return fetchJson(`/api/hospitals/${slug}`);
}

export function getInsurance(): Promise<InsuranceItem[]> {
  return fetchJson("/api/insurance");
}

export function getProcedures(): Promise<ProcedureBrief[]> {
  return fetchJson("/api/procedures");
}

export function searchServices(
  query: string,
  maxBudget?: number
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query });
  if (maxBudget != null) params.set("max_budget", String(maxBudget));
  return fetchJson(`/api/search?${params}`);
}

export function searchAI(query: string): Promise<AISearchResponse> {
  return fetchJson<AISearchResponse>("/api/search/ai", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export function formatKes(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}
