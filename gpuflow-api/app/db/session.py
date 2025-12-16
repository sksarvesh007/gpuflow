# this will create a database connection 
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import CONFIG

engine = create_engine(CONFIG.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()