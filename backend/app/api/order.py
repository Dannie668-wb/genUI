from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.store import _orders

router = APIRouter(prefix="/order", tags=["order"])


class StatusUpdate(BaseModel):
    status: str


@router.get("/{order_id}")
async def get_order(order_id: str):
    order = _orders.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status")
async def update_order_status(order_id: str, body: StatusUpdate):
    if order_id not in _orders:
        raise HTTPException(status_code=404, detail="Order not found")
    _orders[order_id]["status"] = body.status
    return {"ok": True, "order_id": order_id, "status": body.status}
