import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "MedLens AI"
    app_version: str = "0.1.0"
    debug: bool = False
    
    # Database
    database_url: str = "postgresql+psycopg2://medlens:medlens@localhost:5432/medlens"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    rate_limit_per_hour: int = 1000
    
    # LLM Providers
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"
    cohere_api_key: Optional[str] = None
    cohere_model: str = "command-r-plus"
    
    # Monitoring
    sentry_dsn: Optional[str] = None
    enable_metrics: bool = True
    
    # Redis (for caching/rate limiting)
    redis_url: str = "redis://localhost:6379"
    
    # CORS
    allowed_origins: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
