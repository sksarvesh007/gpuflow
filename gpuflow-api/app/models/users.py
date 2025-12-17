import uuid
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.db.base_class import Base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship


class User(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # financial details
    credits = Column(Integer, default=0)

    # Role
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    machines = relationship("Machine", back_populates="owner")
    jobs = relationship("Job", back_populates="owner")
