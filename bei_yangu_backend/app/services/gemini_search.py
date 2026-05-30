import json
import re

import google.generativeai as genai
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Procedure
from app.schemas.api import AISearchResponse, ProcedureBrief
from app.services.search import _procedure_brief, search_by_procedures


def _fallback_summary(query: str, procedures: list[Procedure]) -> str:
    if not procedures:
        return (
            f"We could not map '{query}' to a specific procedure in our catalogue. "
            "Try searching by procedure name (e.g. 'normal delivery', 'appendectomy')."
        )
    names = ", ".join(p.name for p in procedures[:4])
    return (
        f"Based on your description ('{query}'), these procedures may be relevant: {names}. "
        "Below are hospitals in Kenya that offer them, ranked from lowest starting price."
    )


def _parse_json_array(text: str) -> list[str]:
    match = re.search(r"\[[\s\S]*?\]", text)
    if not match:
        return []
    try:
        data = json.loads(match.group())
        if isinstance(data, list):
            return [str(x).strip().lower() for x in data if x]
    except json.JSONDecodeError:
        pass
    return []


def ai_search(db: Session, query: str) -> AISearchResponse:
    all_procedures = db.query(Procedure).all()
    catalogue = [{"slug": p.slug, "name": p.name, "category": p.category} for p in all_procedures]

    suggested: list[Procedure] = []
    summary = _fallback_summary(query, [])

    if settings.gemini_api_key:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"""You are a medical search assistant for Bei Yangu, a Kenya healthcare price comparison platform.

User query: "{query}"

Available procedures (JSON):
{json.dumps(catalogue, indent=2)}

Respond ONLY with valid JSON in this exact shape (no markdown):
{{
  "summary": "2-3 sentence plain-language overview for the patient, mentioning Kenya hospitals and that prices are ranges in KES",
  "procedure_slugs": ["slug1", "slug2"]
}}

Pick 1-5 procedure slugs from the catalogue that best match the user's symptoms or intent.
If nothing fits well, return empty procedure_slugs and explain in summary."""
        raw = ""
        try:
            response = model.generate_content(prompt)
            raw = (response.text or "").strip()
            raw = re.sub(r"^```json\s*|\s*```$", "", raw, flags=re.MULTILINE)
            parsed = json.loads(raw)
            summary = parsed.get("summary", summary)
            slugs = [s.lower() for s in parsed.get("procedure_slugs", [])]
            slug_set = set(slugs)
            suggested = [p for p in all_procedures if p.slug in slug_set]
        except Exception:
            slugs = _parse_json_array(raw)
            suggested = [p for p in all_procedures if p.slug in slugs]

    if not suggested:
        q = query.lower()
        for p in all_procedures:
            if q in p.name.lower() or q in p.slug.replace("-", " "):
                suggested.append(p)
        if not suggested and settings.gemini_api_key:
            summary = _fallback_summary(query, [])

    if not suggested:
        keyword_map = {
            "abdomen": ["appendectomy", "hernia-repair", "caesarean-section"],
            "stomach": ["appendectomy", "endoscopy"],
            "pregnant": ["normal-delivery", "caesarean-section"],
            "birth": ["normal-delivery", "caesarean-section"],
            "baby": ["normal-delivery", "caesarean-section"],
            "testicular": ["testicular-exploration", "prostate-biopsy"],
            "chest": ["chest-xray", "ct-scan"],
            "head": ["ct-scan", "mri-scan"],
        }
        for key, slugs in keyword_map.items():
            if key in q:
                suggested = [p for p in all_procedures if p.slug in slugs]
                break
        summary = _fallback_summary(query, suggested)

    search_result = search_by_procedures(db, query, suggested)
    return AISearchResponse(
        query=query,
        ai_summary=summary,
        suggested_procedures=[_procedure_brief(p) for p in suggested],
        results=search_result.results,
        used_ai=bool(settings.gemini_api_key),
    )
