from langchain_core.tools import tool


@tool
def search_nearby_shops(location: str, keyword: str = "") -> dict:
    """搜索用户附近的外卖店铺。location 为配送地址，keyword 为商品关键词（如"奶茶"）。"""
    # Mock 数据，Phase 6 替换为真实 API
    return {
        "shops": [
            {"id": "shop_001", "name": "瑞幸咖啡(XX店)", "rating": 4.8, "distance": "300m"},
            {"id": "shop_002", "name": "喜茶(XX店)", "rating": 4.7, "distance": "500m"},
        ]
    }
