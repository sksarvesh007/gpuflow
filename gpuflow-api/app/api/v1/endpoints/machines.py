import secrets
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.models.machine import Machine
from app.models.users import User
from app.schemas.machine import MachineCreate, MachineResponse

router = APIRouter()

@router.post("/", response_model=MachineResponse)
def register_machine(machine_in: MachineCreate, db: Session = Depends(get_db), current_user: User = Depends(deps.get_current_user)):
    new_token = secrets.token_urlsafe(32)
    new_machine = Machine(
        name= machine_in.name, 
        description= machine_in.description,
        owner_id= current_user.id,
        auth_token= new_token,
        status= "offline"
    )

    db.add(new_machine)
    db.commit()
    db.refresh(new_machine)
    return new_machine

@router.get("/", response_model=list[MachineResponse])
def get_my_machines(db: Session = Depends(get_db), current_user: User = Depends(deps.get_current_user)):
    return current_user.machines
