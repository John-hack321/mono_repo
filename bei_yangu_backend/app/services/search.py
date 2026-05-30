from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models import Hospital, HospitalService, Procedure, ProcedureSynonym
from app.schemas.api import (
    HospitalListItem,
    ProcedureBrief,
    SearchResponse,
    SearchResultItem,
    ServiceItem,
)


def _procedure_brief(p: Procedure) -> ProcedureBrief:
    return ProcedureBrief(id=p.id, name=p.name, slug=p.slug, category=p.category or "General")


def _hospital_list_item(h: Hospital, service_count: int, insurers: list[str]) -> HospitalListItem:
    return HospitalListItem(
        id=h.id,
        name=h.name,
        slug=h.slug,
        location=h.location or "",
        county=h.county or "",
        tier=h.tier or "",
        ownership=h.ownership or "",
        rating=h.rating or 0,
        review_count=h.review_count or 0,
        image_url=h.image_url or "",
        service_count=service_count,
        insurers=insurers,
    )


def _service_item(s: HospitalService) -> ServiceItem:
    return ServiceItem(
        id=s.id,
        procedure=_procedure_brief(s.procedure),
        price_min=s.price_min,
        price_max=s.price_max,
        currency=s.currency or "KES",
        notes=s.notes or "",
    )


def resolve_procedure_ids(db: Session, query: str) -> list[Procedure]:
    q = query.strip().lower()
    if not q:
        return []

    procedures = (
        db.query(Procedure)
        .outerjoin(ProcedureSynonym)
        .filter(
            or_(
                Procedure.name.ilike(f"%{q}%"),
                Procedure.slug.ilike(f"%{q.replace(' ', '-')}%"),
                Procedure.description.ilike(f"%{q}%"),
                ProcedureSynonym.synonym.ilike(f"%{q}%"),
            )
        )
        .distinct()
        .all()
    )

    expanded: dict[int, Procedure] = {p.id: p for p in procedures}
    for proc in list(procedures):
        for related in proc.related:
            expanded[related.id] = related

    return list(expanded.values())


def search_by_procedures(
    db: Session,
    query: str,
    procedures: list[Procedure],
    max_budget: int | None = None,
) -> SearchResponse:
    if not procedures:
        return SearchResponse(query=query, matched_procedures=[], results=[], total=0)

    proc_ids = [p.id for p in procedures]
    services = (
        db.query(HospitalService)
        .options(
            joinedload(HospitalService.hospital).joinedload(Hospital.insurance_links),
            joinedload(HospitalService.procedure),
        )
        .filter(HospitalService.procedure_id.in_(proc_ids))
        .all()
    )

    if max_budget is not None:
        services = [s for s in services if s.price_min <= max_budget]

    services.sort(key=lambda s: (s.price_min, -(s.hospital.rating or 0)))

    results: list[SearchResultItem] = []
    for rank, s in enumerate(services, start=1):
        h = s.hospital
        insurers = [link.insurance.name for link in h.insurance_links if link.insurance]
        item = SearchResultItem(
            hospital=_hospital_list_item(h, len(h.services), insurers),
            service=_service_item(s),
            match_score=1.0,
            rank=rank,
        )
        results.append(item)

    return SearchResponse(
        query=query,
        matched_procedures=[_procedure_brief(p) for p in procedures],
        results=results,
        total=len(results),
    )


def search_services(
    db: Session, query: str, max_budget: int | None = None
) -> SearchResponse:
    procedures = resolve_procedure_ids(db, query)
    return search_by_procedures(db, query, procedures, max_budget)
