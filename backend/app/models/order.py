from sqlalchemy import String, Float, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    session_id: Mapped[str] = mapped_column(String, ForeignKey("sessions.id"))
    shop_name: Mapped[str] = mapped_column(String, default="")
    items: Mapped[list] = mapped_column(JSON, default=list)
    total: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String, default="pending")
    # status: pending | paid | delivering | delivered | failed
