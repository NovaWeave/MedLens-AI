from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
from slowapi.util import get_remote_address
from slowapi import Limiter
import structlog

from ..deps import get_db
from .. import models
from ..llm import LLMClient
from ..config import settings

logger = structlog.get_logger()
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()

TRUSTED_SOURCES = [
    {"name": "MoHFW", "url": "https://www.mohfw.gov.in"},
    {"name": "ICMR", "url": "https://www.icmr.gov.in"},
    {"name": "NHP", "url": "https://www.nhp.gov.in"},
    {"name": "WHO India", "url": "https://www.who.int/india"},
]


class MisinformationScanRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Article or post text to scan")
    url: Optional[str] = None


class ClaimAssessment(BaseModel):
    claim: str
    risk: str
    rationale: str
    references: List[str]


class MisinformationScanResponse(BaseModel):
    assessments: List[ClaimAssessment]
    summary: Optional[str] = None
    high_risk_count: int = 0


@router.post("/misinformation-scan", response_model=MisinformationScanResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def scan_misinformation(
    request: MisinformationScanRequest, 
    db: Session = Depends(get_db),
    remote_address: str = Depends(get_remote_address)
):
    """Scan content for medical misinformation"""
    try:
        logger.info(
            "Misinformation scan request",
            text_length=len(request.text),
            url=request.url,
            client_ip=remote_address,
        )

        sentences = [s.strip() for s in request.text.split('.') if s.strip()]
        flagged: List[ClaimAssessment] = []
        risky_keywords = [
            "miracle cure",
            "100% effective",
            "no side effects",
            "detox",
            "instantly",
            "secret remedy",
        ]

        for s in sentences:
            lower = s.lower()
            if any(k in lower for k in risky_keywords):
                flagged.append(
                    ClaimAssessment(
                        claim=s,
                        risk="high",
                        rationale="Contains absolute or sensational claims often associated with misinformation.",
                        references=[src["url"] for src in TRUSTED_SOURCES],
                    )
                )

        if not flagged:
            flagged.append(
                ClaimAssessment(
                    claim="General content review",
                    risk="low",
                    rationale="No obvious red flags detected with heuristics. Verify health claims with trusted sources.",
                    references=[src["url"] for src in TRUSTED_SOURCES],
                )
            )

        summary_text = None
        try:
            llm = LLMClient()
            notes = llm.analyze_claims(request.text)
            if notes:
                summary_text = notes[0][:1000]
        except Exception as e:
            logger.warning("LLM analysis failed", error=str(e))

        high_count = sum(1 for c in flagged if c.risk == 'high')
        response = MisinformationScanResponse(
            assessments=flagged,
            summary=summary_text,
            high_risk_count=high_count,
        )

        try:
            summary = f"claims={len(flagged)}; high_risk={high_count}"
            db.add(models.UserLog(type="misinformation_scan", input_text=request.text[:5000], result_summary=summary))
            db.commit()
            logger.info(
                "Misinformation scan completed",
                claims_count=len(flagged),
                high_risk_count=high_count,
            )
        except Exception as e:
            db.rollback()
            logger.error("Failed to log misinformation scan", error=str(e))

        return response

    except Exception as e:
        logger.error("Misinformation scan failed", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to analyze content")


