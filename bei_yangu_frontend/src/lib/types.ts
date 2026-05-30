export interface ProcedureBrief {
  id: number;
  name: string;
  slug: string;
  category: string;
}

export interface InsuranceItem {
  id: number;
  name: string;
  slug: string;
  hospital_count?: number;
}

export interface HospitalListItem {
  id: number;
  name: string;
  slug: string;
  location: string;
  county: string;
  tier: string;
  ownership: string;
  rating: number;
  review_count: number;
  image_url: string;
  service_count: number;
  insurers: string[];
}

export interface ServiceItem {
  id: number;
  procedure: ProcedureBrief;
  price_min: number;
  price_max: number;
  currency: string;
  notes: string;
  equipment?: string[];
}

export interface HospitalDetail extends Omit<HospitalListItem, "service_count" | "insurers"> {
  description: string;
  services: ServiceItem[];
  insurers: InsuranceItem[];
  equipment: string[];
}

export interface SearchResultItem {
  hospital: HospitalListItem;
  service: ServiceItem;
  match_score: number;
  rank: number;
}

export interface SearchResponse {
  query: string;
  matched_procedures: ProcedureBrief[];
  results: SearchResultItem[];
  total: number;
}

export interface AISearchResponse {
  query: string;
  ai_summary: string;
  suggested_procedures: ProcedureBrief[];
  results: SearchResultItem[];
  used_ai: boolean;
}

export interface HomeResponse {
  featured_hospitals: HospitalListItem[];
  top_insurers: InsuranceItem[];
  popular_procedures: ProcedureBrief[];
  stats: Record<string, number>;
}
