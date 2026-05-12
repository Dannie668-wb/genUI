from sqlalchemy import String, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, default="")
    preferences: Mapped[dict] = mapped_column(JSON, default=dict)
    # preferences 结构: {"default_address": "", "flavor": "少冰", "brand": "瑞幸"}
