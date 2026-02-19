import sys
import os
from sqlalchemy import create_engine, MetaData, Table, insert, text
from sqlalchemy.orm import sessionmaker

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from app.core.config import DATABASE_URL

# SQLite Connection
SQLITE_URL = "sqlite:///montage.db"
sqlite_engine = create_engine(SQLITE_URL)

# PostgreSQL Connection
POSTGRES_URL = DATABASE_URL
postgres_engine = create_engine(POSTGRES_URL)

# Table Order (respecting foreign keys)
TABLES_TO_MIGRATE = [
    "users",
    "verification_codes",
    "videos",
    "posts",
    "views",
    "likes",
    "comments",
    "follows",
    "reposts",
    "achievements",
    "sponsored_ads",
    "notifications",
    "push_subscriptions"
]

def run_migration():
    metadata_sqlite = MetaData()
    metadata_pg = MetaData()
    
    with sqlite_engine.connect() as sqlite_conn:
        with postgres_engine.connect() as pg_conn:
            for table_name in TABLES_TO_MIGRATE:
                print(f"Migrating table: {table_name}...")
                try:
                    # Reflect table from SQLite
                    table_sqlite = Table(table_name, metadata_sqlite, autoload_with=sqlite_engine)
                    
                    # Fetch all data
                    rows = sqlite_conn.execute(table_sqlite.select()).fetchall()
                    if not rows:
                        print(f"  - No data in {table_name}, skipping.")
                        continue

                    # Prepare data
                    data = [dict(row._mapping) for row in rows]
                    
                    # Reflect table from Postgres to ensure we are using the right schema
                    table_pg = Table(table_name, metadata_pg, autoload_with=postgres_engine)
                    
                    # Clear existing data in Postgres (optional)
                    pg_conn.execute(table_pg.delete())
                    
                    # Insert data
                    pg_conn.execute(table_pg.insert(), data)
                    pg_conn.commit()
                    print(f"  - Successfully migrated {len(data)} rows.")
                    
                except Exception as e:
                    print(f"  - Error migrating {table_name}: {e}")
                    pg_conn.rollback()

if __name__ == "__main__":
    print("Starting robust migration...")
    run_migration()
    print("Migration complete.")
