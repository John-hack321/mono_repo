from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from sqlalchemy.orm import joinedload

from app.models import Hospital, HospitalInsurance, InsuranceProvider, Procedure
from app.schemas.api import HomeResponse, HospitalListItem, InsuranceItem, ProcedureBrief
from app.services.search import _hospital_list_item

router = APIRouter(prefix="/api", tags=["home"])


@router.get("/home", response_model=HomeResponse)
def home(db: Session = Depends(get_db)):
    hospitals = (
        db.query(Hospital)
        .options(
            joinedload(Hospital.insurance_links).joinedload(HospitalInsurance.insurance),
            joinedload(Hospital.services),
        )
        .order_by(Hospital.rating.desc())
        .limit(6)
        .all()
    )
    featured: list[HospitalListItem] = []
    for h in hospitals:
        insurers = [link.insurance.name for link in h.insurance_links if link.insurance]
        featured.append(_hospital_list_item(h, len(h.services), insurers))

    insurer_rows = (
        db.query(
            InsuranceProvider,
            func.count(HospitalInsurance.id).label("hospital_count"),
        )
        .outerjoin(HospitalInsurance)
        .group_by(InsuranceProvider.id)
        .order_by(func.count(HospitalInsurance.id).desc())
        .limit(6)
        .all()
    )
    top_insurers = [
        InsuranceItem(
            id=row[0].id,
            name=row[0].name,
            slug=row[0].slug,
            hospital_count=row[1] or 0,
        )
        for row in insurer_rows
    ]

    popular = db.query(Procedure).limit(8).all()
    popular_procedures = [
        ProcedureBrief(id=p.id, name=p.name, slug=p.slug, category=p.category or "General")
        for p in popular
    ]

    return HomeResponse(
        featured_hospitals=featured,
        top_insurers=top_insurers,
        popular_procedures=popular_procedures,
        stats={
            "hospitals": db.query(func.count(Hospital.id)).scalar() or 0,
            "procedures": db.query(func.count(Procedure.id)).scalar() or 0,
            "insurers": db.query(func.count(InsuranceProvider.id)).scalar() or 0,
        },
    )


@router.get("/insurance", response_model=list[InsuranceItem])
def list_insurance(db: Session = Depends(get_db)):
    rows = (
        db.query(
            InsuranceProvider,
            func.count(HospitalInsurance.id).label("hospital_count"),
        )
        .outerjoin(HospitalInsurance)
        .group_by(InsuranceProvider.id)
        .order_by(InsuranceProvider.name)
        .all()
    )
    return [
        InsuranceItem(id=r[0].id, name=r[0].name, slug=r[0].slug, hospital_count=r[1] or 0) for r in rows
    ]


@router.get("/procedures", response_model=list[ProcedureBrief])
def list_procedures(db: Session = Depends(get_db)):
    procs = db.query(Procedure).order_by(Procedure.name).all()
    return [ProcedureBrief(id=p.id, name=p.name, slug=p.slug, category=p.category or "General") for p in procs]
