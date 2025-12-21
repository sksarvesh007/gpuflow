from app.models.machine import Machine
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.job import Job
from app.models.users import User
from app.schemas.job import JobCreate, JobResponse, JobUpdate
from app.services.tasks import process_job_task
from datetime import datetime, timezone

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


@router.patch(path="/{job_id}")
def update_job_status(
    job_id: str,
    job_update: JobUpdate,
    current_machine: Machine = Depends(deps.get_current_machine),
    db: Session = Depends(deps.get_db),
):
    job: Job | None = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job.machine_id) != str(current_machine.id):
        raise HTTPException(status_code=401, detail="Unauthorized to update this job")
    if job_update.status:
        job.status = job_update.status
    if job_update.status == "running":
        job.started_at: datetime = datetime.now(timezone.utc)
    if job_update.status == "completed":
        job.completed_at: datetime = datetime.now(timezone.utc)
        job.result_url = job_update.result
        if job.machine:
            job.machine.status = "idle"
    if job_update.error_message:
        job.error_message = job_update.error_message
    db.commit()
    db.refresh(job)
    return job


@router.get("/", response_model=list[JobResponse])
def get_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> list[Job]:
    return db.query(Job).filter(Job.creator_id == current_user.id).all()


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Job:
    job: Job | None = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this job")
    return job
