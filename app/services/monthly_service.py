import logging
from uuid import UUID
from sqlalchemy.orm import Session
from datetime import datetime
from collections import defaultdict

from app.models.transaction import Transaction
from app.models.monthly_summary import MonthlySummary
from app.services.ai_service import generate_ai_insight

logger = logging.getLogger("wealthlens.monthly")


def _f(value) -> float:
    """Convert Decimal or float to float safely."""
    if value is None:
        return 0.0
    return float(value)


def generate_monthly_summary(month: str, user_id: UUID, db: Session):
    """
    Generate or refresh the monthly financial summary for a given YYYY-MM month,
    scoped to the specified user.
    Returns a MonthlySummary ORM object with dynamic signals attached.
    """
    try:
        year_str, month_str = month.split("-")
        year = int(year_str)
        month_number = int(month_str)
    except ValueError:
        raise ValueError(f"Invalid month format: '{month}'. Expected YYYY-MM.")

    if not (1 <= month_number <= 12):
        raise ValueError(f"Invalid month number: {month_number}")

    start_date = datetime(year, month_number, 1)

    if month_number == 12:
        end_date = datetime(year + 1, 1, 1)
        previous_month = f"{year}-11"
    else:
        end_date = datetime(year, month_number + 1, 1)
        previous_month = (
            f"{year - 1}-12"
            if month_number == 1
            else f"{year}-{month_number - 1:02d}"
        )

    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_date >= start_date,
        Transaction.transaction_date < end_date,
    ).all()

    logger.info(f"[{month}] Found {len(transactions)} transactions for user={user_id}")

    total_income = 0.0
    total_expense = 0.0
    weekend_spend = 0.0
    weekday_spend = 0.0
    category_breakdown: dict = defaultdict(float)
    transaction_count = 0
    expense_count = 0

    for txn in transactions:
        transaction_count += 1
        txn_type = (txn.transaction_type or "").lower().strip()
        amount = _f(txn.amount)

        if txn_type == "credit":
            total_income += amount
        else:
            total_expense += amount
            expense_count += 1

        day = (
            txn.transaction_date.weekday()
            if hasattr(txn.transaction_date, "weekday")
            else datetime.combine(txn.transaction_date, datetime.min.time()).weekday()
        )

        if day >= 5:
            weekend_spend += amount
        else:
            weekday_spend += amount

        category = (
            txn.final_category
            or txn.user_category
            or txn.ai_category
            or "Uncategorized"
        )
        if txn_type != "credit":
            category_breakdown[category] += amount

    # Historical comparison — scoped to same user
    prev_summary = db.query(MonthlySummary).filter(
        MonthlySummary.user_id == user_id,
        MonthlySummary.month == previous_month,
    ).first()

    expense_change_percentage = 0.0
    spike_detected = False
    expense_income_ratio = 0.0

    if prev_summary and _f(prev_summary.total_expense) > 0:
        prev_expense = _f(prev_summary.total_expense)
        expense_change_percentage = (
            (total_expense - prev_expense) / prev_expense
        ) * 100
        if expense_change_percentage >= 30:
            spike_detected = True
            logger.warning(f"[{month}] Expense spike detected: {expense_change_percentage:.1f}% for user={user_id}")

    if total_income > 0:
        expense_income_ratio = total_expense / total_income

    # Upsert summary — scoped to user
    existing = db.query(MonthlySummary).filter(
        MonthlySummary.user_id == user_id,
        MonthlySummary.month == month,
    ).first()
    if existing:
        db.delete(existing)
        db.commit()

    summary = MonthlySummary(
        user_id=user_id,
        month=month,
        total_income=round(total_income, 2),
        total_expense=round(total_expense, 2),
        weekend_spend=round(weekend_spend, 2),
        weekday_spend=round(weekday_spend, 2),
        category_breakdown={k: round(v, 2) for k, v in category_breakdown.items()},
    )

    db.add(summary)
    db.commit()
    db.refresh(summary)

    # Attach transient signals (not persisted — used by AI layer)
    summary.expense_change_percentage = round(expense_change_percentage, 2)
    summary.expense_income_ratio = round(expense_income_ratio, 4)
    summary.spike_detected = spike_detected
    summary.transaction_count = transaction_count
    summary.expense_count = expense_count

    logger.info(
        f"[{month}] Summary generated. "
        f"Income={total_income:.0f}, Expense={total_expense:.0f}, "
        f"Ratio={expense_income_ratio:.2f}, user={user_id}"
    )
    return summary


def generate_summary_and_ai(month: str, user_id: UUID, db: Session):
    """
    Full automation pipeline:
    1. Generate/refresh monthly summary
    2. Generate AI insight from summary
    Both scoped to the given user_id.
    """
    logger.info(f"[{month}] Starting full pipeline for user={user_id}")
    generate_monthly_summary(month, user_id, db)
    generate_ai_insight(month, user_id, db)
    logger.info(f"[{month}] Full pipeline complete for user={user_id}")
