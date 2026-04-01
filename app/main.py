import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.database.session import engine
from app.routers.transaction_router import router as transaction_router
from app.routers.auth_router import router as auth_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("wealthlens")

app = FastAPI(
    title="WealthLens API",
    description="AI-powered personal finance backend",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler — never expose raw stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again."},
    )

# Schema is managed by Alembic migrations — do NOT use create_all here.
# Run: alembic upgrade head  before starting the server.
app.include_router(auth_router)
app.include_router(transaction_router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "WealthLens API is running", "version": "3.0.0"}


@app.get("/health", tags=["Health"])
def health_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"DB health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected"},
        )
