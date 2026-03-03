from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.session import Base, engine

# Models
from app.models.transaction import Transaction
from app.models.monthly_summary import MonthlySummary
from app.models.ai_insight import AIInsight

# Routers
from app.routers.transaction_router import router as transaction_router


# ✅ FIRST create app
app = FastAPI(title="WealthLens API")


# ✅ THEN add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# Create Tables
# ==================================================
Base.metadata.create_all(bind=engine)


# ==================================================
# Register Routers
# ==================================================
app.include_router(transaction_router)


# ==================================================
# Health Check
# ==================================================
@app.get("/")
def root():
    return {"message": "WealthLens backend is running 🚀"}


@app.get("/db-test")
def db_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {
            "db_status": "connected",
            "result": result.scalar(),
        }