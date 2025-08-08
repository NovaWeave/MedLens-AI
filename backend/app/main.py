import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

from .routes import health, symptoms, misinformation
from .routes import logs as logs_routes
from .db import engine, Base
from . import models
from .config import settings
from .middleware import setup_middleware, limiter

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Initialize Sentry if DSN is provided
if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        integrations=[FastApiIntegration()],
        traces_sample_rate=0.1,
        environment="production" if not settings.debug else "development"
    )


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
    )

    # Setup middleware
    setup_middleware(app)
    
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # State for limiter
    app.state.limiter = limiter

    # Include routers
    app.include_router(health.router, prefix="/api")
    app.include_router(symptoms.router, prefix="/api")
    app.include_router(misinformation.router, prefix="/api")
    app.include_router(logs_routes.router, prefix="/api")

    # Exception handlers
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        logger.error(
            "HTTP exception",
            status_code=exc.status_code,
            detail=exc.detail,
            url=str(request.url),
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.error(
            "Validation error",
            errors=exc.errors(),
            url=str(request.url),
        )
        return JSONResponse(
            status_code=422,
            content={"detail": "Validation error", "errors": exc.errors()}
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(
            "Unhandled exception",
            error=str(exc),
            url=str(request.url),
            exc_info=True,
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )

    return app


app = create_app()

# Ensure tables exist in case migrations haven't been run yet (dev convenience)
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")
except Exception as e:
    logger.error("Failed to create database tables", error=str(e))


@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up", version=settings.app_version)


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down")


