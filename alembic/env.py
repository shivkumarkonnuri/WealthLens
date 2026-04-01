import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Make sure the app package is importable when running alembic from the
# project root (WL_updated/) — the directory containing both /alembic and /app
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

# ---------------------------------------------------------------------------
# Import Base + ALL models so Alembic can detect schema changes via autogenerate
# ---------------------------------------------------------------------------
from app.database.session import Base       # noqa: E402
from app.models import transaction          # noqa: E402, F401
from app.models import monthly_summary      # noqa: E402, F401
from app.models import ai_insight           # noqa: E402, F401
from app.models import user                 # noqa: E402, F401  ← NEW

# ---------------------------------------------------------------------------
# Alembic Config object
# ---------------------------------------------------------------------------
config = context.config

# Override sqlalchemy.url from environment (never hardcode credentials)
config.set_main_option(
    "sqlalchemy.url",
    os.getenv(
        "DATABASE_URL",
        "postgresql://wealthuser:wealthpass@localhost:5432/wealthlensdb",
    ),
)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
