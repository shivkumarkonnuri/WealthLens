import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import JSON
from datetime import datetime

from app.database.session import Base


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    month = Column(String, nullable=False)

    risk_level = Column(String, nullable=False)

    summary = Column(String, nullable=False)

    actionable_suggestions = Column(JSON, nullable=False)

    raw_ai_response = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)