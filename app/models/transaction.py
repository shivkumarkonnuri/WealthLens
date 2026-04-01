import uuid
from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID

from app.database.session import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Auth: every transaction belongs to a user
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    transaction_date = Column(Date, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)  # Numeric for financial precision
    description = Column(String, nullable=True)
    merchant_name = Column(String, nullable=True)
    transaction_type = Column(String, nullable=False)  # debit / credit
    currency = Column(String, nullable=False)

    ai_category = Column(String, nullable=True)
    user_category = Column(String, nullable=True)
    final_category = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
