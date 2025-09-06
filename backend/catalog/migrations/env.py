# migrations/env.py
import os
import sys
from pathlib import Path
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# --- Make project root importable (so "src" and "lib" work) ---
PROJECT_ROOT = Path(__file__).resolve().parents[1]  # /app
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Alembic Config object
config = context.config

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- Import Base and models so metadata is populated ---
from lib.db.postgres import Base  # your Declarative Base
import src.models  # noqa: F401    # import registers all tables on Base.metadata

target_metadata = Base.metadata

def _build_sync_dsn() -> str:
    """
    Compose a sync DSN for Alembic.
    Prefer ALEMBIC_DATABASE_URL; otherwise build from env vars.
    """
    dsn = os.getenv("ALEMBIC_DATABASE_URL")
    if dsn:
        return dsn
    user = os.getenv("POSTGRES_USER", "postgres")
    pwd  = os.getenv("POSTGRES_PASSWORD", "postgres")
    host = os.getenv("POSTGRES_HOST", "db")  # in Docker network
    port = os.getenv("POSTGRES_PORT", "5432")
    db   = os.getenv("POSTGRES_DB", "catalog")
    return f"postgresql+psycopg2://{user}:{pwd}@{host}:{port}/{db}"

# Force URL (alembic.ini is fallback)
config.set_main_option("sqlalchemy.url", _build_sync_dsn())

def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
        dialect_opts={"paramstyle": "named"},
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
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
