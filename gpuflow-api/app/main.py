from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import CONFIG
from app.db.session import get_db

app = FastAPI(title=CONFIG.PROJECT_NAME)

@app.get("/")
def health_check(db:Session = Depends(get_db)):
    try : 
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = "disconnected: " + str(e)
    
    return {
        "status": "ok",
        "db_status": db_status, 
        "project": CONFIG.PROJECT_NAME,
        "version": CONFIG.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)


