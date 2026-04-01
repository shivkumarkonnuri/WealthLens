"""initial_schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-03-31

Baselines the three existing tables:
  - transactions
  - monthly_summaries
  - ai_insights

NOTE: If these tables already exist in your DB, run:
      alembic stamp 0001_initial_schema
  instead of:
      alembic upgrade head
  (stamping marks the DB as being at this revision without re-running the DDL)
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------
    # transactions
    # ------------------------------------------------------------------
    op.create_table(
        "transactions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            index=True,
        ),
        sa.Column("transaction_date", sa.Date(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("merchant_name", sa.String(), nullable=True),
        sa.Column("transaction_type", sa.String(), nullable=False),
        sa.Column("currency", sa.String(), nullable=False),
        sa.Column("ai_category", sa.String(), nullable=True),
        sa.Column("user_category", sa.String(), nullable=True),
        sa.Column("final_category", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )

    # ------------------------------------------------------------------
    # monthly_summaries
    # ------------------------------------------------------------------
    op.create_table(
        "monthly_summaries",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            index=True,
        ),
        sa.Column("month", sa.String(), nullable=False),
        sa.Column("total_income",  sa.Numeric(precision=12, scale=2), server_default="0"),
        sa.Column("total_expense", sa.Numeric(precision=12, scale=2), server_default="0"),
        sa.Column("weekend_spend", sa.Numeric(precision=12, scale=2), server_default="0"),
        sa.Column("weekday_spend", sa.Numeric(precision=12, scale=2), server_default="0"),
        sa.Column("category_breakdown", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )

    # ------------------------------------------------------------------
    # ai_insights
    # ------------------------------------------------------------------
    op.create_table(
        "ai_insights",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            index=True,
        ),
        sa.Column("month",       sa.String(), nullable=False),
        sa.Column("risk_level",  sa.String(), nullable=False),
        sa.Column("summary",     sa.String(), nullable=False),
        sa.Column("actionable_suggestions", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("raw_ai_response",        postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("ai_insights")
    op.drop_table("monthly_summaries")
    op.drop_table("transactions")
