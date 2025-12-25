"""add device_id to machine

Revision ID: add_device_id_001
Revises: 57ccaf3ce226
Create Date: 2025-12-24 06:25:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "add_device_id_001"
down_revision: Union[str, Sequence[str], None] = "57ccaf3ce226"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add device_id column to machine table."""
    op.add_column("machine", sa.Column("device_id", sa.String(), nullable=True))
    op.create_index(op.f("ix_machine_device_id"), "machine", ["device_id"], unique=True)


def downgrade() -> None:
    """Remove device_id column from machine table."""
    op.drop_index(op.f("ix_machine_device_id"), table_name="machine")
    op.drop_column("machine", "device_id")
