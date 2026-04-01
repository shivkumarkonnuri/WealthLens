"""fix_float_to_numeric

Revision ID: 0002_fix_float_to_numeric
Revises: 0001_initial_schema
Create Date: 2026-03-31

Alters money columns from DOUBLE PRECISION (Float) → NUMERIC(12,2)
on all three affected tables.

Also changes created_at columns to DateTime(timezone=True) with
server_default=now() instead of the deprecated Python-side utcnow().

Run:
    alembic upgrade head
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_fix_float_to_numeric"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------
    # transactions.amount  DOUBLE PRECISION → NUMERIC(12, 2)
    # ------------------------------------------------------------------
    op.alter_column(
        "transactions",
        "amount",
        existing_type=sa.Float(),
        type_=sa.Numeric(precision=12, scale=2),
        existing_nullable=False,
        postgresql_using="amount::numeric(12,2)",
    )

    # Fix created_at on transactions
    op.alter_column(
        "transactions",
        "created_at",
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        existing_nullable=True,
    )

    # ------------------------------------------------------------------
    # monthly_summaries — four Numeric money columns
    # ------------------------------------------------------------------
    for col in ("total_income", "total_expense", "weekend_spend", "weekday_spend"):
        op.alter_column(
            "monthly_summaries",
            col,
            existing_type=sa.Float(),
            type_=sa.Numeric(precision=12, scale=2),
            postgresql_using=f"{col}::numeric(12,2)",
        )

    # Fix created_at on monthly_summaries
    op.alter_column(
        "monthly_summaries",
        "created_at",
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        existing_nullable=True,
    )

    # Fix created_at on ai_insights
    op.alter_column(
        "ai_insights",
        "created_at",
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        existing_nullable=True,
    )


def downgrade() -> None:
    # Revert Numeric → Float (precision is lost — acceptable for rollback only)
    op.alter_column(
        "transactions",
        "amount",
        existing_type=sa.Numeric(precision=12, scale=2),
        type_=sa.Float(),
        existing_nullable=False,
        postgresql_using="amount::double precision",
    )

    for col in ("total_income", "total_expense", "weekend_spend", "weekday_spend"):
        op.alter_column(
            "monthly_summaries",
            col,
            existing_type=sa.Numeric(precision=12, scale=2),
            type_=sa.Float(),
            postgresql_using=f"{col}::double precision",
        )
