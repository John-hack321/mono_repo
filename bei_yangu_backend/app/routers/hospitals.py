from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Hospital, HospitalEquipment, HospitalInsurance, HospitalService
from app.schemas.api import HospitalDetail, HospitalListItem, InsuranceItem, ServiceItem
from app.services.search import _hospital_list_item, _procedure_brief, _service_item

router = APIRouter(prefix="/api/hospitals", tags=["hospitals"])


@router.get("", response_model=list[HospitalListItem])
def list_hospitals(
    ownership: str | None = None,
    county: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Hospital).options(
        joinedload(Hospital.insurance_links).joinedload(HospitalInsurance.insurance),
        joinedload(Hospital.services),
    )
    if ownership:
        q = q.filter(Hospital.ownership == ownership)
    if county:
        q = q.filter(Hospital.county.ilike(f"%{county}%"))
    hospitals = q.order_by(Hospital.rating.desc()).all()
    out: list[HospitalListItem] = []
    for h in hospitals:
        insurers = [link.insurance.name for link in h.insurance_links if link.insurance]
        out.append(_hospital_list_item(h, len(h.services), insurers))
    return out


@router.get("/{slug}", response_model=HospitalDetail)
def get_hospital(slug: str, db: Session = Depends(get_db)):
    hospital = (
        db.query(Hospital)
        .options(
            joinedload(Hospital.services).joinedload(HospitalService.procedure),
            joinedload(Hospital.insurance_links).joinedload(HospitalInsurance.insurance),
            joinedload(Hospital.equipment_links).joinedload(HospitalEquipment.equipment),
        )
        .filter(Hospital.slug == slug)
        .first()
    )
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    insurers = [
        InsuranceItem(
            id=link.insurance.id,
            name=link.insurance.name,
            slug=link.insurance.slug,
        )
        for link in hospital.insurance_links
        if link.insurance
    ]
    equipment = [link.equipment.name for link in hospital.equipment_links if link.equipment]
    services = [
        ServiceItem(
            id=s.id,
            procedure=_procedure_brief(s.procedure),
            price_min=s.price_min,
            price_max=s.price_max,
            currency=s.currency or "KES",
            notes=s.notes or "",
            equipment=equipment,
        )
        for s in sorted(hospital.services, key=lambda x: x.price_min)
    ]

    return HospitalDetail(
        id=hospital.id,
        name=hospital.name,
        slug=hospital.slug,
        description=hospital.description or "",
        location=hospital.location or "",
        county=hospital.county or "",
        tier=hospital.tier or "",
        ownership=hospital.ownership or "",
        rating=hospital.rating or 0,
        review_count=hospital.review_count or 0,
        image_url=hospital.image_url or "",
        services=services,
        insurers=insurers,
        equipment=equipment,
    )
