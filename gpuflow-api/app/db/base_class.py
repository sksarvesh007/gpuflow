from typing import Any
from sqlalchemy.orm import as_declarative, declared_attr
from sqlalchemy import MetaData


@as_declarative()
class Base:
    id: Any
    __name__: str
    metadata: MetaData

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

    def __init__(self, **kwargs: Any) -> None:
        pass
