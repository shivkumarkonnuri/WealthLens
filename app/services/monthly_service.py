from sqlalchemy.orm import Session
from datetime import datetime
from collections import defaultdict

from app.models.transaction import Transaction
from app.models.monthly_summary import MonthlySummary
from app.services.ai_service import generate_ai_insight


# ==================================================
# Monthly Summary Generator (With Historical Signals)
# ==================================================
def generate_monthly_summary(month: str, db: Session):
    """
    month format: YYYY-MM
    Example: 2026-03
    """

    year_str, month_str = month.split("-")
    year = int(year_str)
    month_number = int(month_str)

    start_date = datetime(year, month_number, 1)

    # Determine end date and previous month
    if month_number == 12:
        end_date = datetime(year + 1, 1, 1)
        previous_month = f"{year}-11"
    else:
        end_date = datetime(year, month_number + 1, 1)
        previous_month = (
            f"{year-1}-12"
            if month_number == 1
            else f"{year}-{month_number-1:02d}"
        )

    transactions = db.query(Transaction).filter(
        Transaction.transaction_date >= start_date,
        Transaction.transaction_date < end_date
    ).all()

    total_income = 0.0
    total_expense = 0.0
    weekend_spend = 0.0
    weekday_spend = 0.0

    category_breakdown = defaultdict(float)

    # -------------------------------
    # Monthly Aggregation
    # -------------------------------
    for txn in transactions:

        if txn.transaction_type.lower() == "credit":
            total_income += txn.amount
        else:
            total_expense += txn.amount

        if txn.transaction_date.weekday() >= 5:
            weekend_spend += txn.amount
        else:
            weekday_spend += txn.amount

        category = (
            txn.final_category
            or txn.user_category
            or txn.ai_category
            or "Uncategorized"
        )

        category_breakdown[category] += txn.amount

    # -------------------------------
    # Historical Comparison
    # -------------------------------
    prev_summary = db.query(MonthlySummary).filter(
        MonthlySummary.month == previous_month
    ).first()

    expense_change_percentage = 0.0
    spike_detected = False
    expense_income_ratio = 0.0

    if prev_summary and prev_summary.total_expense > 0:
        expense_change_percentage = (
            (total_expense - prev_summary.total_expense)
            / prev_summary.total_expense
        ) * 100

        if expense_change_percentage >= 30:
            spike_detected = True

    if total_income > 0:
        expense_income_ratio = total_expense / total_income

    # -------------------------------
    # Remove Existing Summary (If Any)
    # -------------------------------
    existing_summary = db.query(MonthlySummary).filter(
        MonthlySummary.month == month
    ).first()

    if existing_summary:
        db.delete(existing_summary)
        db.commit()

    summary = MonthlySummary(
        month=month,
        total_income=total_income,
        total_expense=total_expense,
        weekend_spend=weekend_spend,
        weekday_spend=weekday_spend,
        category_breakdown=dict(category_breakdown),
    )

    db.add(summary)
    db.commit()
    db.refresh(summary)

    # Attach dynamic intelligence signals (not persisted yet)
    summary.expense_change_percentage = expense_change_percentage
    summary.expense_income_ratio = expense_income_ratio
    summary.spike_detected = spike_detected

    return summary


# ==================================================
# Full Automation Pipeline
# ==================================================
def generate_summary_and_ai(month: str, db: Session):
    """
    Fully automated pipeline:
    1. Generate Monthly Summary
    2. Generate AI Insight
    """

    generate_monthly_summary(month, db)
    generate_ai_insight(month, db)