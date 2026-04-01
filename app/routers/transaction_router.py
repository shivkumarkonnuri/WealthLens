import logging
import csv
import io
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction_schema import TransactionCreate, TransactionResponse
from app.services.monthly_service import generate_summary_and_ai, generate_monthly_summary
from app.services.ai_service import generate_ai_insight
from app.services.categorization_service import auto_categorize
from app.core.dependencies import get_current_user

logger = logging.getLogger("wealthlens.router")

router = APIRouter(prefix="/transactions", tags=["Transactions"])

REQUIRED_CSV_COLUMNS = {
    "transaction_date",
    "amount",
    "description",
    "merchant_name",
    "transaction_type",
    "currency",
}


# ==================================================
# Create Single Transaction
# ==================================================
@router.post("/", response_model=TransactionResponse, status_code=201)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = auto_categorize(transaction.merchant_name or "", transaction.description or "")
    txn = Transaction(
        user_id=current_user.id,
        transaction_date=transaction.transaction_date,
        amount=transaction.amount,
        description=transaction.description,
        merchant_name=transaction.merchant_name,
        transaction_type=transaction.transaction_type,
        currency=transaction.currency,
        ai_category=category,
        final_category=category,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    logger.info(f"Transaction created: {txn.id} | {category} | user={current_user.id}")
    return txn


# ==================================================
# Get All Transactions (with optional month filter)
# ==================================================
@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    month: Optional[str] = Query(None, description="Filter by YYYY-MM"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Scoped to current user only
    q = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if month:
        try:
            year, month_num = int(month[:4]), int(month[5:])
            start = datetime(year, month_num, 1)
            end = datetime(year + 1, 1, 1) if month_num == 12 else datetime(year, month_num + 1, 1)
            q = q.filter(
                Transaction.transaction_date >= start,
                Transaction.transaction_date < end,
            )
        except (ValueError, IndexError):
            raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")
    return q.order_by(Transaction.transaction_date.desc()).offset(offset).limit(limit).all()


# ==================================================
# Upload CSV
# ==================================================
@router.post("/upload-csv")
def upload_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    try:
        contents = file.file.read().decode("utf-8-sig")  # handles BOM
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File encoding must be UTF-8.")

    reader = csv.DictReader(io.StringIO(contents))
    fieldnames = {f.strip().lower() for f in (reader.fieldnames or [])}

    if not REQUIRED_CSV_COLUMNS.issubset(fieldnames):
        missing = REQUIRED_CSV_COLUMNS - fieldnames
        raise HTTPException(
            status_code=400,
            detail=f"CSV missing required columns: {', '.join(sorted(missing))}",
        )

    inserted_count = 0
    skipped_count = 0
    months_to_update: set[str] = set()
    errors: list[str] = []

    for i, row in enumerate(reader, start=2):
        try:
            parsed_date = datetime.strptime(row["transaction_date"].strip(), "%Y-%m-%d").date()
            amount = float(row["amount"].strip())
            if amount <= 0:
                raise ValueError("Amount must be positive")

            txn_type = row["transaction_type"].strip().lower()
            if txn_type not in ("debit", "credit"):
                raise ValueError(f"transaction_type must be 'debit' or 'credit', got '{txn_type}'")

            month_str = parsed_date.strftime("%Y-%m")
            months_to_update.add(month_str)

            category = auto_categorize(
                row.get("merchant_name", "").strip(),
                row.get("description", "").strip(),
            )

            txn = Transaction(
                user_id=current_user.id,
                transaction_date=parsed_date,
                amount=amount,
                description=row.get("description", "").strip() or None,
                merchant_name=row.get("merchant_name", "").strip() or None,
                transaction_type=txn_type,
                currency=row.get("currency", "INR").strip().upper(),
                ai_category=category,
                final_category=category,
            )
            db.add(txn)
            inserted_count += 1

        except Exception as e:
            skipped_count += 1
            errors.append(f"Row {i}: {str(e)}")
            logger.warning(f"CSV row {i} skipped: {e}")

    db.commit()
    logger.info(
        f"CSV upload: {inserted_count} inserted, {skipped_count} skipped, "
        f"months={months_to_update}, user={current_user.id}"
    )

    for month in months_to_update:
        background_tasks.add_task(generate_summary_and_ai, month, current_user.id, db)

    return {
        "message": "CSV processed successfully",
        "rows_inserted": inserted_count,
        "rows_skipped": skipped_count,
        "skipped_errors": errors[:10],
        "automation_triggered_for": sorted(months_to_update),
    }


# ==================================================
# Generate Monthly Summary
# ==================================================
@router.post("/generate-summary/{month}")
def generate_summary(
    month: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate monthly financial summary. Format: YYYY-MM"""
    try:
        result = generate_monthly_summary(month, current_user.id, db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================================================
# Generate AI Insight
# ==================================================
@router.post("/generate-ai/{month}")
def generate_ai(
    month: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate AI insight for a month. Format: YYYY-MM"""
    try:
        result = generate_ai_insight(month, current_user.id, db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================================================
# Get Available Months (Dynamic from DB)
# ==================================================
@router.get("/available-months")
def get_available_months(
    limit: int = Query(12, ge=1, le=60),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns distinct months from the current user's transactions, most recent first."""
    months = (
        db.query(
            func.to_char(Transaction.transaction_date, "YYYY-MM").label("month")
        )
        .filter(Transaction.user_id == current_user.id)
        .distinct()
        .order_by(func.to_char(Transaction.transaction_date, "YYYY-MM").desc())
        .limit(limit)
        .all()
    )
    return [m.month for m in months]


# ==================================================
# Get Transaction Stats for a Month
# ==================================================
@router.get("/stats/{month}")
def get_month_stats(
    month: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns quick stats without regenerating full summary."""
    try:
        year, month_num = int(month[:4]), int(month[5:])
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")

    start = datetime(year, month_num, 1)
    end = datetime(year + 1, 1, 1) if month_num == 12 else datetime(year, month_num + 1, 1)

    total = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= start,
        Transaction.transaction_date < end,
    ).count()

    return {"month": month, "transaction_count": total}


# ==================================================
# Backfill Missing Categories
# ==================================================
@router.post("/backfill-categories")
def backfill_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Re-categorize the current user's transactions with NULL final_category."""
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.final_category == None,
    ).all()

    updated = 0
    for txn in transactions:
        cat = auto_categorize(txn.merchant_name or "", txn.description or "")
        txn.ai_category = cat
        txn.final_category = cat
        updated += 1

    db.commit()
    logger.info(f"Backfill complete: {updated} records updated for user={current_user.id}")
    return {"message": "Backfill complete", "records_updated": updated}
