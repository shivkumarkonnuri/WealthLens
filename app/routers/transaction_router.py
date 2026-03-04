from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    HTTPException,
    BackgroundTasks,
)
from sqlalchemy.orm import Session
from typing import List
import csv
import io
from datetime import datetime

from app.database.session import get_db
from app.models.transaction import Transaction
from app.schemas.transaction_schema import (
    TransactionCreate,
    TransactionResponse,
)
from app.services.monthly_service import (
    generate_summary_and_ai,
    generate_monthly_summary,
)
from app.services.ai_service import generate_ai_insight
from app.services.categorization_service import auto_categorize


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


# ==================================================
# Create Single Transaction (With Auto Categorization)
# ==================================================
@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
):
    category = auto_categorize(
        transaction.merchant_name,
        transaction.description
    )

    new_transaction = Transaction(
        transaction_date=transaction.transaction_date,
        amount=transaction.amount,
        description=transaction.description,
        merchant_name=transaction.merchant_name,
        transaction_type=transaction.transaction_type,
        currency=transaction.currency,
        ai_category=category,
        final_category=category,
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction


# ==================================================
# Get All Transactions
# ==================================================
@router.get("/", response_model=List[TransactionResponse])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).all()


# ==================================================
# Upload CSV (Auto Categorization + Full Automation)
# ==================================================
@router.post("/upload-csv")
def upload_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed",
        )

    contents = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(contents))

    required_columns = {
        "transaction_date",
        "amount",
        "description",
        "merchant_name",
        "transaction_type",
        "currency",
    }

    if not required_columns.issubset(reader.fieldnames or []):
        raise HTTPException(
            status_code=400,
            detail="CSV headers do not match required format",
        )

    inserted_count = 0
    months_to_update = set()

    for row in reader:
        try:
            parsed_date = datetime.strptime(
                row["transaction_date"], "%Y-%m-%d"
            ).date()

            month_str = parsed_date.strftime("%Y-%m")
            months_to_update.add(month_str)

            category = auto_categorize(
                row["merchant_name"],
                row["description"]
            )

            new_transaction = Transaction(
                transaction_date=parsed_date,
                amount=float(row["amount"]),
                description=row["description"],
                merchant_name=row["merchant_name"],
                transaction_type=row["transaction_type"],
                currency=row["currency"],
                ai_category=category,
                final_category=category,
            )

            db.add(new_transaction)
            inserted_count += 1

        except Exception:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid data format in row: {row}",
            )

    db.commit()

    for month in months_to_update:
        background_tasks.add_task(
            generate_summary_and_ai,
            month,
            db,
        )

    return {
        "message": "CSV uploaded successfully",
        "rows_inserted": inserted_count,
        "automation_triggered_for": list(months_to_update),
    }


# ==================================================
# Manual Monthly Summary Trigger
# ==================================================
@router.post("/generate-summary/{month}")
def generate_summary(month: str, db: Session = Depends(get_db)):
    result = generate_monthly_summary(month, db)
    return result


# ==================================================
# Manual AI Insight Trigger
# ==================================================
@router.post("/generate-ai/{month}")
def generate_ai(month: str, db: Session = Depends(get_db)):
    result = generate_ai_insight(month, db)
    return result


# ==================================================
# Backfill Missing Categories
# ==================================================
@router.post("/backfill-categories")
def backfill_categories(db: Session = Depends(get_db)):

    transactions = db.query(Transaction).filter(
        Transaction.final_category == None
    ).all()

    updated_count = 0

    for txn in transactions:
        category = auto_categorize(
            txn.merchant_name,
            txn.description
        )

        txn.ai_category = category
        txn.final_category = category
        updated_count += 1

    db.commit()

    return {
        "message": "Backfill completed successfully",
        "records_updated": updated_count,
    }


# ==================================================
# Get Available Months (Latest 12 Months)
# ==================================================
from sqlalchemy import func

@router.get("/available-months")
def get_available_months(db: Session = Depends(get_db)):

    months = (
        db.query(
            func.to_char(Transaction.transaction_date, "YYYY-MM").label("month")
        )
        .distinct()
        .order_by(func.to_char(Transaction.transaction_date, "YYYY-MM").desc())
        .limit(12)
        .all()
    )

    return [m.month for m in months]