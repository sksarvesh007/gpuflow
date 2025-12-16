from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.core import security
from app.db.session import get_db
from app.models.users import User
from app.core.config import CONFIG

router = APIRouter()

@router.post("/login/access-token")
def login_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):    
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=CONFIG.ACCESS_TOKEN_EXPIRE_MINUTES)
    # we are using user id as the subject of the token 
    access_token = security.create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires) 
    return {"access_token": access_token, "token_type": "bearer"}