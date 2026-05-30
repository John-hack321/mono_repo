from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.api import AISearchRequest, AISearchResponse, SearchResponse
from app.services.gemini_search import ai_search
from app.services.search import search_services

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=1),
    max_budget: int | None = Query(None, ge=0),
    db: Session = Depends(get_db),
):
    return search_services(db, q, max_budget)


@router.post("/ai", response_model=AISearchResponse)
def search_ai(body: AISearchRequest, db: Session = Depends(get_db)):
    return ai_search(db, body.query)
