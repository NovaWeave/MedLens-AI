import os
from typing import Optional, List
import structlog
from openai import OpenAI
import cohere

from .config import settings

logger = structlog.get_logger()


class LLMClient:
    """Minimal wrapper to switch between providers via env flags.

    This is a placeholder for real integration with OpenAI or Cohere.
    """

    def __init__(self) -> None:
        self.provider = None
        self._openai: Optional[OpenAI] = None
        self._cohere: Optional[cohere.Client] = None
        
        if settings.openai_api_key:
            self.provider = "openai"
            self._openai = OpenAI(api_key=settings.openai_api_key)
            logger.info("OpenAI client initialized")
        elif settings.cohere_api_key:
            self.provider = "cohere"
            self._cohere = cohere.Client(settings.cohere_api_key)
            logger.info("Cohere client initialized")
        else:
            self.provider = "heuristic"
            logger.info("Using heuristic fallback (no API keys configured)")

    def analyze_claims(self, text: str) -> List[str]:
        """Analyze text for medical claims using configured LLM provider"""
        try:
            if self.provider == "openai" and self._openai is not None:
                try:
                    completion = self._openai.chat.completions.create(
                        model=settings.openai_model,
                        messages=[
                            {"role": "system", "content": "You are a careful medical content validator. Identify dubious claims and cite reliable sources (NIH, CDC, WHO, Mayo Clinic)."},
                            {"role": "user", "content": text},
                        ],
                        temperature=0.2,
                        max_tokens=500,
                    )
                    result = completion.choices[0].message.content
                    logger.info("OpenAI analysis completed", text_length=len(text))
                    return [result] if result else []
                except Exception as e:
                    logger.error("OpenAI analysis failed", error=str(e))
                    
            if self.provider == "cohere" and self._cohere is not None:
                try:
                    resp = self._cohere.chat(
                        model=settings.cohere_model,
                        message=f"Flag dubious medical claims and cite sources for the following text:\n{text}",
                        temperature=0.2,
                    )
                    logger.info("Cohere analysis completed", text_length=len(text))
                    return [resp.text] if resp.text else []
                except Exception as e:
                    logger.error("Cohere analysis failed", error=str(e))
                    
            # Fallback heuristic
            logger.info("Using heuristic claim analysis")
            return ["Using heuristic claim analysis (no API keys configured)."]
            
        except Exception as e:
            logger.error("LLM analysis failed", error=str(e), exc_info=True)
            return ["Analysis failed due to technical error."]


