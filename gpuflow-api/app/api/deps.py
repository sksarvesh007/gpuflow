from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import CONFIG
from app.models.users import User
from app.models.machine import Machine
from app.db.session import get_db
from sqlalchemy.orm import Session
from fastapi import Header

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=CONFIG.API_V1_STR + "/login/access-token")


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, CONFIG.SECRET_KEY, algorithms=[CONFIG.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_machine(
    authorization: str = Header(None), db: Session = Depends(get_db)
) -> Machine:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authentication")

    token = authorization.replace("Bearer ", "")
    machine = db.query(Machine).filter(Machine.auth_token == token).first()
    if not machine:
        raise HTTPException(status_code=401, detail="Invalid Machine token")
    return machine
