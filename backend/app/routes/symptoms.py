from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
from slowapi.util import get_remote_address
from slowapi import Limiter
import structlog

from ..deps import get_db
from .. import models
from ..config import settings
from ..nlp import SymptomExtractor
from ..cache import CacheClient

logger = structlog.get_logger()
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()


class SymptomCheckRequest(BaseModel):
    text: str = Field(..., min_length=2, description="Free-text symptom description")
    age: Optional[int] = Field(None, ge=0, le=120)
    sex: Optional[str] = Field(None, description="male | female | other")


class SymptomSuggestion(BaseModel):
    name: str
    confidence: float


class SymptomCheckResponse(BaseModel):
    extracted_symptoms: List[SymptomSuggestion]
    suggested_actions: List[str]
    caution_flags: List[str]


extractor = SymptomExtractor(enable=True)
cache = CacheClient()


@router.post("/symptom-check", response_model=SymptomCheckResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def symptom_check(
    request: SymptomCheckRequest, 
    db: Session = Depends(get_db),
    remote_address: str = Depends(get_remote_address),
    prefer_model: bool = True,
):
    """Analyze symptoms and provide suggestions using HF NER + heuristics."""
    try:
        logger.info(
            "Symptom check request",
            text_length=len(request.text),
            age=request.age,
            sex=request.sex,
            client_ip=remote_address,
        )

        # Cache key
        cache_key = f"symptom_extract:v1:{int(prefer_model)}:{hash(request.text)}"
        cached = cache.get_json(cache_key)
        if cached and isinstance(cached.get("results"), list):
            raw = cached["results"]
        else:
            # Extract via HF NER + heuristics
            raw = extractor.extract_symptoms(request.text, prefer_model=prefer_model)
            cache.set_json(cache_key, {"results": raw}, ttl_seconds=3600)

        extracted = [SymptomSuggestion(name=r["name"], confidence=r["confidence"]) for r in raw][:10]

        # Indian-context suggestions
        known_actions = {
            "fever": ["Monitor temperature", "Hydrate well", "Paracetamol as per dosage if needed"],
            "cough": ["Avoid irritants", "Warm fluids", "Consult local physician if persistent"],
            "headache": ["Rest", "Hydration", "Paracetamol if appropriate"],
            "chest pain": ["Seek urgent care at nearest hospital (112/108) if severe"]
        }

        suggested_actions: List[str] = []
        caution_flags: List[str] = []

        lower_text = request.text.lower()
        if not extracted:
            caution_flags.append("No clear symptoms extracted. Provide more detail or consult a medical professional.")
        for s in extracted:
            if s.name in known_actions:
                suggested_actions.extend(known_actions[s.name])
            if s.name in {"chest pain", "shortness of breath"}:
                caution_flags.append("Potential emergency; Dial 112/108 or visit a nearby hospital immediately if severe.")

        # Deduplicate
        seen = set()
        unique_actions: List[str] = []
        for a in suggested_actions:
            if a not in seen:
                seen.add(a)
                unique_actions.append(a)

        response = SymptomCheckResponse(
            extracted_symptoms=extracted,
            suggested_actions=unique_actions,
            caution_flags=caution_flags,
        )

        # Persist anonymized log
        try:
            summary = f"extracted={','.join([s.name for s in extracted])}; actions={len(unique_actions)}; cautions={len(caution_flags)}"
            db.add(models.UserLog(type="symptom_check", input_text=request.text[:5000], result_summary=summary))
            db.commit()
            logger.info(
                "Symptom check completed",
                extracted_count=len(extracted),
                actions_count=len(unique_actions),
                cautions_count=len(caution_flags),
            )
        except Exception as e:
            db.rollback()
            logger.error("Failed to log symptom check", error=str(e))

        return response

    except Exception as e:
        logger.error("Symptom check failed", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to analyze symptoms")


