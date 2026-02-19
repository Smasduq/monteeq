import sys
import os
from sqlalchemy import create_engine, MetaData, Table, inspect, func
from sqlalchemy.orm import sessionmaker

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from app.core.config import DATABASE_URL
from app.models.models import User, Video, Post, Comment

def verify():
    print("--- Database Verification ---")
    
    # SQLite
    sqlite_engine = create_engine("sqlite:///montage.db")
    SqliteSession = sessionmaker(bind=sqlite_engine)
    sqlite_session = SqliteSession()
    
    # Postgres
    postgres_engine = create_engine(DATABASE_URL)
    PostgresSession = sessionmaker(bind=postgres_engine)
    postgres_session = PostgresSession()
    
    models = [User, Video, Post, Comment]
    
    for model in models:
        table_name = model.__tablename__
        sqlite_count = sqlite_session.query(model).count()
        postgres_count = postgres_session.query(model).count()
        
        status = "✅ MATCH" if sqlite_count == postgres_count else "❌ MISMATCH"
        print(f"Table {table_name:15}: SQLite={sqlite_count:3}, Postgres={postgres_count:3} -> {status}")

    sqlite_session.close()
    postgres_session.close()

if __name__ == "__main__":
    verify()
