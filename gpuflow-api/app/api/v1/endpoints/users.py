from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse
from app.models.users import User
from app.core.security import get_password_hash
from app.api import deps

router = APIRouter()


@router.post("/", response_model=UserResponse)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    user: User | None = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user_in.password)

    new_user = User(
        email=user_in.email, hashed_password=hashed_pw, credits=0, is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(deps.get_current_user)) -> User:
    """this returns with the current user profile"""
    return current_user
