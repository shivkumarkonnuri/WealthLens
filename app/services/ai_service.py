import os
import re
import json
import logging
import httpx
from uuid import UUID
from sqlalchemy.orm import Session
from collections import Counter
from datetime import datetime
from dotenv import load_dotenv

from app.models.monthly_summary import MonthlySummary
from app.models.ai_insight import AIInsight
from app.models.transaction import Transaction

load_dotenv()
logger = logging.getLogger("wealthlens.ai")


def _f(value) -> float:
    """Convert Decimal or float to float safely."""
    if value is None:
        return 0.0
    return float(value)


# ==========================================================
# LLM Call
# ==========================================================

def call_llm(signal_payload: dict) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    model = os.getenv("OPENROUTER_MODEL", "openai/gpt-3.5-turbo")

    if not api_key:
        raise ValueError("OPENROUTER_API_KEY is not set in environment")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://wealthlens.app",
        "X-Title": "WealthLens",
    }

    system_prompt = (
        "You are a financial risk explanation engine for Indian users. "
        "Do NOT change the provided risk_level — it is determined by a deterministic engine. "
        "Generate a concise 2-3 sentence summary explaining the financial situation. "
        "Then generate exactly 3 actionable suggestions as plain strings. "
        "Use Indian Rupee (₹) context. "
        "Respond ONLY in this strict JSON format with no markdown:\n"
        '{"summary": "...", "actionable_suggestions": ["...", "...", "..."]}'
    )

    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(signal_payload)},
        ],
        "temperature": 0.2,
        "max_tokens": 600,
    }

    response = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=body,
        timeout=60.0,
    )
    response.raise_for_status()

    result = response.json()
    content = result["choices"][0]["message"]["content"]
    logger.info(f"LLM response received ({len(content)} chars)")
    return content


def _parse_llm_response(raw: str) -> tuple[str, list[str]]:
    """
    Robustly parse LLM JSON response.
    Returns (summary_text, suggestions_list).
    """
    text = raw.strip()

    if "```" in text:
        text = text.replace("```json", "").replace("```", "").strip()

    start = text.find("{")
    if start == -1:
        raise ValueError("No JSON object found in LLM response")
    text = text[start:]

    text += "]" * max(0, text.count("[") - text.count("]"))
    text += "}" * max(0, text.count("{") - text.count("}"))

    text = re.sub(r",\s*([}\]])", r"\1", text)

    data = json.loads(text)
    summary_text = str(data.get("summary", "")).strip()

    raw_suggestions = (
        data.get("actionable_suggestions")
        or data.get("suggestions")
        or []
    )

    suggestions = []
    for s in raw_suggestions:
        if isinstance(s, dict):
            suggestions.append(
                s.get("description") or s.get("action") or s.get("reason") or str(s)
            )
        else:
            suggestions.append(str(s).strip())

    return summary_text, suggestions


# ==========================================================
# Hybrid AI Engine
# ==========================================================

def generate_ai_insight(month: str, user_id: UUID, db: Session):

    # Scoped to user
    summary = db.query(MonthlySummary).filter(
        MonthlySummary.user_id == user_id,
        MonthlySummary.month == month,
    ).first()

    if not summary:
        raise ValueError(f"Monthly summary not found for {month}. Generate summary first.")

    try:
        year, month_number = int(month[:4]), int(month[5:])
    except (ValueError, IndexError):
        raise ValueError(f"Invalid month format: {month}")

    total_income  = _f(summary.total_income)
    total_expense = _f(summary.total_expense)
    weekend_spend = _f(summary.weekend_spend)

    # Historical comparison — scoped to user
    prev_month = f"{year - 1}-12" if month_number == 1 else f"{year}-{month_number - 1:02d}"
    prev_summary = db.query(MonthlySummary).filter(
        MonthlySummary.user_id == user_id,
        MonthlySummary.month == prev_month,
    ).first()

    expense_change_pct = 0.0
    spike_detected = False

    if prev_summary and _f(prev_summary.total_expense) > 0:
        prev_expense = _f(prev_summary.total_expense)
        expense_change_pct = (
            (total_expense - prev_expense) / prev_expense
        ) * 100
        spike_detected = expense_change_pct >= 30

    expense_income_ratio = (
        total_expense / total_income if total_income > 0 else 0.0
    )

    # Behavioural signals — scoped to user
    start_dt = datetime(year, month_number, 1)
    end_dt = datetime(year + 1, 1, 1) if month_number == 12 else datetime(year, month_number + 1, 1)

    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_date >= start_dt,
        Transaction.transaction_date < end_dt,
    ).all()

    merchant_counter = Counter(
        txn.merchant_name for txn in transactions if txn.merchant_name
    )
    subscription_flag = any(count >= 2 for count in merchant_counter.values())

    weekend_ratio = (
        weekend_spend / total_expense if total_expense > 0 else 0.0
    )
    weekend_impulse_flag = weekend_ratio >= 0.5

    concentration_flag = False
    if summary.category_breakdown and total_expense > 0:
        max_val = max(summary.category_breakdown.values(), default=0)
        concentration_flag = (float(max_val) / total_expense) >= 0.6

    # Deterministic risk engine
    risk_level = "Low"

    if total_expense > total_income or expense_income_ratio >= 0.8:
        risk_level = "High"
    elif expense_income_ratio >= 0.6:
        risk_level = "Medium"

    if risk_level == "Low" and (spike_detected or weekend_impulse_flag or concentration_flag):
        risk_level = "Medium"

    if risk_level == "Medium" and subscription_flag:
        risk_level = "High"

    logger.info(f"[{month}] Risk={risk_level}, Ratio={expense_income_ratio:.2f}, Spike={spike_detected}, user={user_id}")

    signal_payload = {
        "month": month,
        "risk_level": risk_level,
        "financials": {
            "total_income": total_income,
            "total_expense": total_expense,
            "net_savings": round(total_income - total_expense, 2),
            "expense_income_ratio": round(expense_income_ratio, 2),
            "expense_change_percentage": round(expense_change_pct, 2),
            "weekend_ratio": round(weekend_ratio, 2),
        },
        "behavior_flags": {
            "spike_detected": spike_detected,
            "subscription_flag": subscription_flag,
            "weekend_impulse_flag": weekend_impulse_flag,
            "concentration_flag": concentration_flag,
        },
        "top_categories": dict(
            sorted(
                (summary.category_breakdown or {}).items(),
                key=lambda x: x[1],
                reverse=True,
            )[:5]
        ),
    }

    summary_text = ""
    suggestions: list[str] = []

    try:
        raw = call_llm(signal_payload)
        summary_text, suggestions = _parse_llm_response(raw)
    except httpx.HTTPStatusError as e:
        logger.error(f"LLM HTTP error {e.response.status_code}: {e.response.text}")
    except Exception as e:
        logger.error(f"LLM call/parse failed: {e}")

    if not summary_text:
        summary_text = (
            f"Your expense-to-income ratio is {expense_income_ratio:.0%} this month. "
            f"Risk level is assessed as {risk_level} based on your spending patterns."
        )

    suggestions = (suggestions or [])[:3]
    fallbacks = [
        "Review and cancel unused subscriptions to reduce fixed costs.",
        "Set a weekly spending limit for discretionary categories like Food and Shopping.",
        "Aim to save at least 20% of your income each month into a dedicated account.",
    ]
    while len(suggestions) < 3:
        suggestions.append(fallbacks[len(suggestions)])

    # Upsert AI insight — scoped to user
    existing = db.query(AIInsight).filter(
        AIInsight.user_id == user_id,
        AIInsight.month == month,
    ).first()
    if existing:
        db.delete(existing)
        db.commit()

    record = AIInsight(
        user_id=user_id,
        month=month,
        risk_level=risk_level,
        summary=summary_text,
        actionable_suggestions=suggestions,
        raw_ai_response=signal_payload,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    logger.info(f"[{month}] AI insight saved (id={record.id}) for user={user_id}")
    return record
