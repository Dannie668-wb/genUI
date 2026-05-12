from langchain_core.tools import tool
import uuid
from app.store import _orders


@tool
def create_order(shop_id: str, items: list, address: str) -> dict:
    """创建订单。items 为商品列表，每项含 name、quantity、ice、sugar。"""
    mock_prices = {"生椰拿铁": 18.0, "美式咖啡": 12.0, "多肉葡萄": 22.0, "芝芝莓莓": 25.0}
    total = sum(mock_prices.get(i.get("name", ""), 15.0) * i.get("quantity", 1) for i in items)
    order = {
        "order_id": f"order_{uuid.uuid4().hex[:8]}",
        "shop_id": shop_id,
        "shop_name": "瑞幸咖啡(XX店)" if shop_id == "shop_001" else "喜茶(XX店)",
        "items": items,
        "address": address,
        "total": round(total, 2),
        "status": "pending",
    }
    _orders[order["order_id"]] = order
    return order
