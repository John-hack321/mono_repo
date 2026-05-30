import type {
  AISearchResponse,
  HomeResponse,
  HospitalDetail,
  HospitalListItem,
  SearchResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export function getHome(): Promise<HomeResponse> {
  return fetchJson("/api/home");
}

export function getHospitals(params?: { ownership?: string }): Promise<HospitalListItem[]> {
  const q = params?.ownership ? `?ownership=${params.ownership}` : "";
  return fetchJson(`/api/hospitals${q}`);
}

export function getHospital(slug: string): Promise<HospitalDetail> {
  return fetchJson(`/api/hospitals/${slug}`);
}

export function searchServices(query: string, maxBudget?: number): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query });
  if (maxBudget != null) params.set("max_budget", String(maxBudget));
  return fetchJson(`/api/search?${params}`);
}

export function searchAI(query: string): Promise<AISearchResponse> {
  return fetch(`${API_BASE}/api/search/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  }).then(async (res) => {
    if (!res.ok) throw new Error("AI search failed");
    return res.json() as Promise<AISearchResponse>;
  });
}

export function formatKes(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}
