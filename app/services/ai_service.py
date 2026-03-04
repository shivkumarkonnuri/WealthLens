import os
import json
import httpx
from sqlalchemy.orm import Session
from collections import Counter
from datetime import datetime
from dotenv import load_dotenv

from app.models.monthly_summary import MonthlySummary
from app.models.ai_insight import AIInsight
from app.models.transaction import Transaction



# ==========================================================
# LLM Call (Explanation Only)
# ==========================================================

def call_llm(signal_payload: dict):

    load_dotenv()

    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL")

    print("Loaded API Key:", OPENROUTER_API_KEY)
    print("Loaded Model:", OPENROUTER_MODEL)

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    body = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a financial risk explanation engine. "
                    "Do NOT change the provided risk_level. "
                    "Generate a clear summary and exactly 3 actionable suggestions. "
                    "Respond ONLY in strict JSON format."
                )
            },
            {
                "role": "user",
                "content": json.dumps(signal_payload)
            }
        ],
        "temperature": 0.2
    }

    response = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=body,
        timeout=60.0
    )

    print("----- OPENROUTER RAW RESPONSE -----")
    print("Status Code:", response.status_code)
    print(response.text)
    print("----- END RESPONSE -----")
    print("STATUS:", response.status_code)

    result = response.json()
    content = result["choices"][0]["message"]["content"]

    return content


# ==========================================================
# Hybrid AI Engine
# ==========================================================

def generate_ai_insight(month: str, db: Session):

    summary = db.query(MonthlySummary).filter(
        MonthlySummary.month == month
    ).first()

    if not summary:
        raise ValueError("Monthly summary not found")

    year_str, month_str = month.split("-")
    year = int(year_str)
    month_number = int(month_str)

    # ------------------------------------------------------
    # Historical Comparison
    # ------------------------------------------------------

    if month_number == 1:
        prev_month = f"{year-1}-12"
    else:
        prev_month = f"{year}-{month_number-1:02d}"

    prev_summary = db.query(MonthlySummary).filter(
        MonthlySummary.month == prev_month
    ).first()

    expense_change_percentage = 0.0
    spike_detected = False

    if prev_summary and prev_summary.total_expense > 0:
        expense_change_percentage = (
            (summary.total_expense - prev_summary.total_expense)
            / prev_summary.total_expense
        ) * 100

        if expense_change_percentage >= 30:
            spike_detected = True

    expense_income_ratio = (
        summary.total_expense / summary.total_income
        if summary.total_income > 0 else 0
    )

    # ------------------------------------------------------
    # Behavioral Detection
    # ------------------------------------------------------

    start_date = datetime(year, month_number, 1)
    end_date = (
        datetime(year + 1, 1, 1)
        if month_number == 12
        else datetime(year, month_number + 1, 1)
    )

    transactions = db.query(Transaction).filter(
        Transaction.transaction_date >= start_date,
        Transaction.transaction_date < end_date
    ).all()

    merchant_counter = Counter(txn.merchant_name for txn in transactions)
    subscription_flag = any(count >= 2 for count in merchant_counter.values())

    weekend_ratio = (
        summary.weekend_spend / summary.total_expense
        if summary.total_expense > 0 else 0
    )

    weekend_impulse_flag = weekend_ratio >= 0.5

    concentration_flag = False
    largest_category_ratio = 0

    if summary.category_breakdown and summary.total_expense > 0:
        max_category_value = max(summary.category_breakdown.values())
        largest_category_ratio = max_category_value / summary.total_expense
        concentration_flag = largest_category_ratio >= 0.6

    # ------------------------------------------------------
    # Deterministic Risk Engine
    # ------------------------------------------------------

    risk_level = "Low"

    if summary.total_expense > summary.total_income:
        risk_level = "High"

    elif expense_income_ratio >= 0.8:
        risk_level = "High"

    elif expense_income_ratio >= 0.6:
        risk_level = "Medium"

    if spike_detected or weekend_impulse_flag or concentration_flag:
        if risk_level == "Low":
            risk_level = "Medium"

    if subscription_flag and risk_level == "Medium":
        risk_level = "High"

    # ------------------------------------------------------
    # Prepare Structured Signals for LLM
    # ------------------------------------------------------

    signal_payload = {
        "month": month,
        "risk_level": risk_level,
        "financials": {
            "total_income": summary.total_income,
            "total_expense": summary.total_expense,
            "expense_income_ratio": round(expense_income_ratio, 2),
            "expense_change_percentage": round(expense_change_percentage, 2),
            "weekend_ratio": round(weekend_ratio, 2)
        },
        "behavior_flags": {
            "spike_detected": spike_detected,
            "subscription_flag": subscription_flag,
            "weekend_impulse_flag": weekend_impulse_flag,
            "concentration_flag": concentration_flag
        }
    }

        # ------------------------------------------------------
    # Call LLM for Explanation
    # ------------------------------------------------------

    try:
        llm_text = call_llm(signal_payload)

        if not llm_text:
            raise ValueError("Empty LLM response")

        llm_text = llm_text.strip()

        # ------------------------------------------
        # Remove markdown blocks if present
        # ------------------------------------------
        if "```" in llm_text:
            llm_text = llm_text.replace("```json", "").replace("```", "").strip()

        # ------------------------------------------
        # Extract JSON portion
        # ------------------------------------------
        start = llm_text.find("{")

        if start == -1:
            raise ValueError("No JSON object found")

        llm_text = llm_text[start:]

        # ------------------------------------------
        # Fix truncated JSON
        # ------------------------------------------

        open_braces = llm_text.count("{")
        close_braces = llm_text.count("}")

        open_brackets = llm_text.count("[")
        close_brackets = llm_text.count("]")

        if close_brackets < open_brackets:
            llm_text += "]" * (open_brackets - close_brackets)

        if close_braces < open_braces:
            llm_text += "}" * (open_braces - close_braces)

        # ------------------------------------------
        # Remove trailing commas
        # ------------------------------------------
        llm_text = llm_text.replace(",}", "}").replace(",]", "]")

        # ------------------------------------------
        # Parse JSON
        # ------------------------------------------
        llm_json = json.loads(llm_text)

        summary_text = str(llm_json.get("summary", "")).strip()

        suggestions = (
            llm_json.get("actionable_suggestions")
            or llm_json.get("suggestions")
            or []
        )

        normalized_suggestions = []

        for s in suggestions:

            if isinstance(s, dict):

                text = (
                    s.get("description")
                    or s.get("reason")
                    or s.get("action")
                    or str(s)
                )

                normalized_suggestions.append(text)

            elif isinstance(s, str):

                normalized_suggestions.append(s)

            else:

                normalized_suggestions.append(str(s))

        suggestions = normalized_suggestions

    except Exception as e:

        print("AI PARSE ERROR:", e)
        print("RAW LLM RESPONSE:", llm_text)

        summary_text = "AI explanation generation failed."

        suggestions = [
            "Review spending patterns.",
            "Monitor recurring subscriptions.",
            "Build emergency savings."
        ]

    # ------------------------------------------
    # Ensure exactly 3 suggestions
    # ------------------------------------------

    suggestions = suggestions[:3]

    while len(suggestions) < 3:
        suggestions.append("Review recurring subscriptions for optimization.")

    # ------------------------------------------------------
    # Store AI Insight
    # ------------------------------------------------------

    existing = db.query(AIInsight).filter(
        AIInsight.month == month
    ).first()

    if existing:
        db.delete(existing)
        db.commit()

    ai_record = AIInsight(
        month=month,
        risk_level=risk_level,  # FROM ENGINE (NOT LLM)
        summary=summary_text,
        actionable_suggestions=suggestions,
        raw_ai_response=signal_payload
    )

    db.add(ai_record)
    db.commit()
    db.refresh(ai_record)

    return ai_record