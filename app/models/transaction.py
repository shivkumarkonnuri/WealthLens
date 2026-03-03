import uuid
from sqlalchemy import Column, String, Float, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from app.database.session import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    transaction_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    merchant_name = Column(String, nullable=True)
    transaction_type = Column(String, nullable=False)  # debit / credit
    currency = Column(String, nullable=False)

    ai_category = Column(String, nullable=True)
    user_category = Column(String, nullable=True)
    final_category = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)