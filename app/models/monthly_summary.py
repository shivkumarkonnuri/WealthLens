import uuid
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import JSON
from sqlalchemy import func

from app.database.session import Base


class MonthlySummary(Base):
    __tablename__ = "monthly_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Auth: every summary belongs to a user
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    month = Column(String, nullable=False)  # Format: YYYY-MM

    total_income  = Column(Numeric(12, 2), default=0.0)
    total_expense = Column(Numeric(12, 2), default=0.0)
    weekend_spend = Column(Numeric(12, 2), default=0.0)
    weekday_spend = Column(Numeric(12, 2), default=0.0)

    category_breakdown = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
