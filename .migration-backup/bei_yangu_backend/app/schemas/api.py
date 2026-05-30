from pydantic import BaseModel, Field


class InsuranceItem(BaseModel):
    id: int
    name: str
    slug: str
    hospital_count: int = 0

    model_config = {"from_attributes": True}


class ProcedureBrief(BaseModel):
    id: int
    name: str
    slug: str
    category: str

    model_config = {"from_attributes": True}


class HospitalListItem(BaseModel):
    id: int
    name: str
    slug: str
    location: str
    county: str
    tier: str
    ownership: str
    rating: float
    review_count: int
    image_url: str
    service_count: int = 0
    insurers: list[str] = []

    model_config = {"from_attributes": True}


class ServiceItem(BaseModel):
    id: int
    procedure: ProcedureBrief
    price_min: int
    price_max: int
    currency: str
    notes: str
    equipment: list[str] = []

    model_config = {"from_attributes": True}


class HospitalDetail(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    location: str
    county: str
    tier: str
    ownership: str
    rating: float
    review_count: int
    image_url: str
    services: list[ServiceItem]
    insurers: list[InsuranceItem]
    equipment: list[str]


class SearchResultItem(BaseModel):
    hospital: HospitalListItem
    service: ServiceItem
    match_score: float = 1.0
    rank: int


class SearchResponse(BaseModel):
    query: str
    matched_procedures: list[ProcedureBrief]
    results: list[SearchResultItem]
    total: int


class AISearchRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500)


class AISearchResponse(BaseModel):
    query: str
    ai_summary: str
    suggested_procedures: list[ProcedureBrief]
    results: list[SearchResultItem]
    used_ai: bool = True


class HomeResponse(BaseModel):
    featured_hospitals: list[HospitalListItem]
    top_insurers: list[InsuranceItem]
    popular_procedures: list[ProcedureBrief]
    stats: dict[str, int]
