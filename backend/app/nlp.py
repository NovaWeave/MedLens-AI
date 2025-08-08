import os
import threading
from typing import List, Dict

import structlog

logger = structlog.get_logger()


class SymptomExtractor:
    """Extracts symptoms from free text using a Hugging Face NER model.

    Uses a singleton-ish lazy loader to avoid repeated heavy initialization.
    Falls back to a simple keyword heuristic if the model is unavailable.
    """

    _instance_lock = threading.Lock()
    _pipeline = None

    def __init__(self, model_name: str = "d4data/biomedical-ner-all", enable: bool = True) -> None:
        self.model_name = model_name
        self.enable = enable

    def _ensure_pipeline(self) -> None:
        if not self.enable:
            return
        if self._pipeline is not None:
            return
        with self._instance_lock:
            if self._pipeline is None:
                try:
                    from transformers import pipeline  # lazy import
                    self._pipeline = pipeline(
                        task="ner",
                        model=self.model_name,
                        aggregation_strategy="simple",
                    )
                    logger.info("HF NER pipeline initialized", model=self.model_name)
                except Exception as e:
                    self._pipeline = None
                    logger.error("Failed to init HF NER pipeline; falling back to heuristics", error=str(e))

    def extract_symptoms(self, text: str, prefer_model: bool = True) -> List[Dict[str, float]]:
        """Return a list of {name, confidence} for extracted symptoms.
        If prefer_model is False, skip the model and use heuristics only.
        """
        normalized = text.strip()
        if not normalized:
            return []

        if prefer_model and self.enable:
            self._ensure_pipeline()
        else:
            # treat as if model is unavailable
            pass

        # Heuristic keywords as a fallback and to merge with NER results
        heuristic_map = {
            "fever": 0.6,
            "cough": 0.6,
            "headache": 0.55,
            "chest pain": 0.7,
            "sore throat": 0.55,
            "shortness of breath": 0.7,
            "fatigue": 0.5,
            "nausea": 0.5,
            "vomiting": 0.5,
            "diarrhea": 0.5,
        }

        found: Dict[str, float] = {}

        # NER path
        if prefer_model and self._pipeline is not None:
            try:
                preds = self._pipeline(normalized)
                for p in preds:
                    label = (p.get("entity_group") or p.get("entity") or "").upper()
                    word = (p.get("word") or "").strip()
                    score = float(p.get("score") or 0.0)
                    if not word:
                        continue
                    if any(key in label for key in ["SYMPT", "DISE", "PROBLEM", "CONDITION"]):
                        name = word.lower()
                        prev = found.get(name, 0.0)
                        if score > prev:
                            found[name] = score
            except Exception as e:
                logger.error("HF NER extraction failed; using heuristics only", error=str(e))

        # Heuristic path
        lower = normalized.lower()
        for k, conf in heuristic_map.items():
            if k in lower:
                found[k] = max(found.get(k, 0.0), conf)

        results = [{"name": name, "confidence": float(conf)} for name, conf in found.items()]
        results.sort(key=lambda x: x["confidence"], reverse=True)
        return results
