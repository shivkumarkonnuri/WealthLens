from pydantic import BaseModel
from datetime import date
from typing import Optional
from uuid import UUID


class TransactionCreate(BaseModel):
    transaction_date: date
    amount: float
    description: Optional[str] = None
    merchant_name: Optional[str] = None
    transaction_type: str  # debit / credit
    currency: str


class TransactionResponse(BaseModel):
    id: UUID
    transaction_date: date
    amount: float
    description: Optional[str] = None
    merchant_name: Optional[str] = None
    transaction_type: str
    currency: str
    ai_category: Optional[str] = None
    user_category: Optional[str] = None
    final_category: Optional[str] = None

    class Config:
        from_attributes = True