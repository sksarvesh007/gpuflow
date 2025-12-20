from sqlalchemy.orm import Session
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.job import Job
from app.models.machine import Machine
from app.models.users import User  # noqa: F401
from uuid import UUID
import redis
import json
from app.core.config import CONFIG

redis_client = redis.from_url(CONFIG.CELERY_RESULT_BACKEND, decode_responses=True)


@celery_app.task(acks_late=True)
def process_job_task(job_id: str):
    db: Session = SessionLocal()
    try:
        print("Processing job: ", job_id)
        job: Job | None = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            print("Job not found")
            return

        machine: Machine | None = (
            db.query(Machine)
            .filter(Machine.is_online.is_(True), Machine.status == "idle")
            .first()
        )
        if machine:
            print("Machine found: ", machine.id)

            job.status = "assigned"
            job.machine_id: UUID = machine.id

            machine.status = "busy"

            db.commit()
            print("Job assigned to machine: ", machine.id)

            message = {
                "event": "START_JOB",
                "machine_id": str(machine.id),
                "job_id": str(job.id),
                "code": job.pickled_function.decode("utf-8"),
            }
            redis_client.publish("gpu_events", json.dumps(message))
        else:
            print("No machines available, retrying later")
    except Exception as e:
        print("Error processing job: ", e)
    finally:
        db.close()
