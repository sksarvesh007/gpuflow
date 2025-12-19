from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.job import Job
from app.schemas.job import JobCreate, JobResponse
from app.services.tasks import process_job_task

router = APIRouter()


@router.post(path="/", response_model=JobResponse)
def create_job(
    job_in: JobCreate,
    current_use=Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
):
    code_bytes = job_in.code_string.encode(encoding="utf-8")
    new_job = Job(
        creator_id=current_use.id, pickled_function=code_bytes, status="pending"
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    process_job_task.delay(str(new_job.id))
    return new_job
