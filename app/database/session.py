from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from typing import Generator

# PostgreSQL connection string
DATABASE_URL = "postgresql://wealthuser:wealthpass@localhost:5432/wealthlensdb"

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    echo=True  # Shows SQL queries in terminal (good for development)
)

# Create Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()


# Dependency for FastAPI routes
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()