The Backend for the GPUFlow project

uses uv as package manager and uvicorn as the ASGI server
alembic for database migrations
sqlalchemy as the ORM
postgresql as the database
fastapi as the web framework

setup : to be added

Here are the commands you need. Make sure you open your terminal inside the backend/ folder for all of these.

1. Start the API Server (Terminal 1)
   `uvicorn app.main:app --reload`
2. Start the Celery Worker (Terminal 2 - macOS)
   `OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES celery -A app.core.celery_app worker --loglevel=info`

if you make any changes in data models
`alembic revision --autogenerate -m "message"`
`alembic upgrade head`

if you make any changes in endpoints
`uvicorn app.main:app --reload`
