from app.models.machine import Machine
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.job import Job
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
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job.machine_id) != str(current_machine.id):
        raise HTTPException(status_code=401, detail="Unauthorized to update this job")
    if job_update.status:
        job.status = job_update.status
    if job_update.status == "running":
        job.started_at = datetime.now(timezone.utc)
    if job_update.status == "completed":
        job.completed_at = datetime.now(timezone.utc)
        job.result_url = job_update.result
        if job.machine:
            job.machine.status = "idle"
    db.commit()
    db.refresh(job)
    return job
