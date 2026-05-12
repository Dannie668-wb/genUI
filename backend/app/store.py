"""全局内存存储（Mock 模式，替代 Redis + PostgreSQL）"""
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from fastapi import WebSocket

# session_id → [{"role": ..., "content": ...}]
_sessions: dict[str, list[dict]] = {}

# user_id → {"default_address": ..., "flavor": ..., "brand": ...}
_profiles: dict[str, dict] = {}

# order_id → order dict
_orders: dict[str, dict] = {}

# session_id → WebSocket (payment notification)
_ws_connections: dict[str, "WebSocket"] = {}
