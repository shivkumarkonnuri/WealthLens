"""add_auth

Revision ID: 0003_add_auth
Revises: 0002_fix_float_to_numeric
Create Date: 2026-03-31

Changes:
  1. Create the `users` table.
  2. Add `user_id` FK column to `transactions`, `monthly_summaries`, `ai_insights`.

NOTE: Because existing rows have no user to assign to, this migration creates
a placeholder system user and back-fills user_id before adding the NOT NULL
constraint. On a fresh DB (no existing rows) this all just works cleanly.
"""
from typing import Sequence, Union
import uuid

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0003_add_auth"
down_revision: Union[str, None] = "0002_fix_float_to_numeric"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# A fixed UUID used only to back-fill existing rows during migration.
# This is NOT a real user — it exists solely to satisfy the NOT NULL constraint.
SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001"


def upgrade() -> None:
    # ------------------------------------------------------------------
    # 1. Create users table
    # ------------------------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_id",    "users", ["id"])

    # ------------------------------------------------------------------
    # 2. Insert placeholder system user to back-fill existing rows.
    #    Existing DBs will have rows with no user — we assign them here
    #    so the NOT NULL constraint can be applied cleanly.
    #    On a fresh DB this insert still runs safely (zero rows to fill).
    # ------------------------------------------------------------------
    op.execute(
        f"""
        INSERT INTO users (id, email, full_name, hashed_password, is_active)
        VALUES (
            '{SYSTEM_USER_ID}',
            'system@wealthlens.internal',
            'System (migration placeholder)',
            'not-a-real-hash',
            false
        )
        ON CONFLICT DO NOTHING
        """
    )

    # ------------------------------------------------------------------
    # 3. Add user_id column (nullable first, fill, then make NOT NULL)
    # ------------------------------------------------------------------
    for table in ("transactions", "monthly_summaries", "ai_insights"):
        # Add as nullable so existing rows don't immediately violate constraint
        op.add_column(
            table,
            sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        )

        # Back-fill existing rows with the placeholder user
        op.execute(
            f"UPDATE {table} SET user_id = '{SYSTEM_USER_ID}' WHERE user_id IS NULL"
        )

        # Now apply NOT NULL + FK constraint
        op.alter_column(table, "user_id", nullable=False)

        op.create_foreign_key(
            constraint_name=f"fk_{table}_user_id",
            source_table=table,
            referent_table="users",
            local_cols=["user_id"],
            remote_cols=["id"],
            ondelete="CASCADE",
        )

        op.create_index(f"ix_{table}_user_id", table, ["user_id"])


def downgrade() -> None:
    for table in ("transactions", "monthly_summaries", "ai_insights"):
        op.drop_index(f"ix_{table}_user_id", table_name=table)
        op.drop_constraint(f"fk_{table}_user_id", table, type_="foreignkey")
        op.drop_column(table, "user_id")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id",    table_name="users")
    op.drop_table("users")
