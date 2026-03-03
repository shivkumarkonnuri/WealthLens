import uuid
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import JSON
from datetime import datetime

from app.database.session import Base


class MonthlySummary(Base):
    __tablename__ = "monthly_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    month = Column(String, nullable=False)  # Format: YYYY-MM

    total_income = Column(Float, default=0.0)
    total_expense = Column(Float, default=0.0)

    weekend_spend = Column(Float, default=0.0)
    weekday_spend = Column(Float, default=0.0)

    category_breakdown = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)