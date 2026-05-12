import asyncio
from fastapi import APIRouter, Request, BackgroundTasks, WebSocket, WebSocketDisconnect
from app.store import _orders, _ws_connections

router = APIRouter(prefix="/payment", tags=["payment"])


async def _simulate_delivery(order_id: str):
    """支付成功后模拟配送进度推送"""
    await asyncio.sleep(3)
    if order_id in _orders:
        _orders[order_id]["status"] = "delivering"
    await _push_all({"type": "order_status", "order_id": order_id, "status": "delivering"})

    await asyncio.sleep(8)
    if order_id in _orders:
        _orders[order_id]["status"] = "delivered"
    await _push_all({"type": "order_status", "order_id": order_id, "status": "delivered"})


async def _push_all(data: dict):
    dead = []
    for sid, ws in list(_ws_connections.items()):
        try:
            await ws.send_json(data)
        except Exception:
            dead.append(sid)
    for sid in dead:
        _ws_connections.pop(sid, None)


@router.post("/webhook")
async def payment_webhook(request: Request, background_tasks: BackgroundTasks):
    body = await request.json()
    order_id = body.get("order_id")
    status = body.get("status", "paid")
    if order_id and order_id in _orders:
        _orders[order_id]["status"] = status
        if status == "paid":
            background_tasks.add_task(_simulate_delivery, order_id)
    return {"received": True}


@router.websocket("/ws/{session_id}")
async def payment_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    _ws_connections[session_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        _ws_connections.pop(session_id, None)
