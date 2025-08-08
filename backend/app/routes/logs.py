from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from slowapi.util import get_remote_address
from slowapi import Limiter
import structlog
import hashlib

from ..deps import get_db
from .. import models
from ..config import settings
from ..cache import CacheClient

logger = structlog.get_logger()
limiter = Limiter(key_func=get_remote_address)
cache = CacheClient()

router = APIRouter()


class LogItem(BaseModel):
    id: int
    type: str
    input_text: str
    result_summary: Optional[str]
    created_at: Optional[str]

    class Config:
        from_attributes = True


@router.get("/logs", response_model=List[LogItem])
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def get_logs(
    request: Request,
    db: Session = Depends(get_db),
    type: Optional[str] = Query(None, description="Filter by type: symptom_check | misinformation_scan | feedback"),
    limit: int = Query(10, ge=1, le=100),
):
    try:
        query = db.query(models.UserLog).order_by(desc(models.UserLog.created_at))
        if type:
            query = query.filter(models.UserLog.type == type)
        items = query.limit(limit).all()
        logger.info("Fetched logs", count=len(items), type=type)
        return items
    except Exception as e:
        logger.error("Failed to fetch logs", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch logs")


class FeedbackRequest(BaseModel):
    context: str = Field(..., description="Context of feedback e.g. 'symptom_check' or 'misinformation_scan'")
    verdict: str = Field(..., description="'up' | 'down' | 'neutral'")
    notes: Optional[str] = None


@router.post("/feedback")
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def submit_feedback(
    request: Request,
    payload: FeedbackRequest, 
    db: Session = Depends(get_db)
):
    try:
        summary = f"context={payload.context}; verdict={payload.verdict}; notes={(payload.notes or '')[:200]}"
        db.add(models.UserLog(type="feedback", input_text=payload.context, result_summary=summary))
        db.commit()
        logger.info("Feedback stored", context=payload.context, verdict=payload.verdict)
        return {"ok": True}
    except Exception as e:
        db.rollback()
        logger.error("Failed to store feedback", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to store feedback")


class ClusterItem(BaseModel):
    label: int
    terms: List[str]
    count: int


@router.get("/symptom-patterns", response_model=List[ClusterItem])
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def symptom_patterns(
    request: Request,
    db: Session = Depends(get_db),
    n_clusters: int = Query(3, ge=2, le=10),
    limit: int = Query(200, ge=10, le=1000),
):
    """Cluster recent symptom descriptions using TF-IDF + KMeans (placeholder heuristic if sklearn unavailable)."""
    try:
        # Generate cache key based on parameters
        cache_key = f"patterns:v1:{n_clusters}:{limit}:{hashlib.md5(str(limit).encode()).hexdigest()}"
        cached = cache.get_json(cache_key)
        if cached and isinstance(cached, list):
            logger.info("Returning cached clustering results", n_clusters=n_clusters)
            return cached

        rows = (
            db.query(models.UserLog)
            .filter(models.UserLog.type == "symptom_check")
            .order_by(desc(models.UserLog.created_at))
            .limit(limit)
            .all()
        )
        texts = [r.input_text for r in rows if r.input_text]
        if not texts:
            return []
        clusters: List[ClusterItem] = []
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.cluster import KMeans
            import numpy as np

            vec = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
            X = vec.fit_transform(texts)
            kmeans = KMeans(n_clusters=n_clusters, n_init=10, random_state=42)
            labels = kmeans.fit_predict(X)
            terms = vec.get_feature_names_out()
            order_centroids = kmeans.cluster_centers_.argsort()[:, ::-1]
            for i in range(n_clusters):
                top_terms = [terms[ind] for ind in order_centroids[i, :8]]  # Increased from 5 to 8
                count = int(np.sum(labels == i))
                clusters.append(ClusterItem(label=i, terms=top_terms, count=count))
        except Exception:
            # Heuristic: bucket by simple keywords
            buckets = {
                0: ("fever", ["fever", "temperature", "hot", "chills"]),
                1: ("respiratory", ["cough", "throat", "breath", "chest", "nose"]),
                2: ("gastro", ["nausea", "vomit", "diarrhea", "stomach", "pain"]),
            }
            for i, (_, keywords) in buckets.items():
                count = sum(any(k in t.lower() for k in keywords) for t in texts)
                clusters.append(ClusterItem(label=i, terms=keywords[:8], count=count))
        
        # Cache results for 5 minutes
        cache.set_json(cache_key, [c.dict() for c in clusters], ttl_seconds=300)
        logger.info("Computed and cached clustering results", n_clusters=n_clusters, count=len(clusters))
        return clusters
    except Exception as e:
        logger.error("Clustering failed", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to compute patterns")
