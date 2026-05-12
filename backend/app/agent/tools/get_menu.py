from langchain_core.tools import tool


@tool
def get_menu(shop_id: str) -> dict:
    """获取指定店铺的菜单列表。"""
    # Mock 数据
    menus = {
        "shop_001": [
            {"id": "item_001", "name": "生椰拿铁", "price": 18.0, "description": "椰香浓郁，醇厚拿铁，清甜回甘，每日现榨椰浆"},
            {"id": "item_002", "name": "美式咖啡", "price": 12.0, "description": "精选阿拉比卡豆，口感清爽，适合工作提神"},
            {"id": "item_003", "name": "厚乳拿铁", "price": 20.0, "description": "特调厚乳与浓缩咖啡完美融合，丝滑顺口"},
        ],
        "shop_002": [
            {"id": "item_101", "name": "多肉葡萄", "price": 22.0, "description": "新鲜葡萄粒满满，茶香与果香交织"},
            {"id": "item_102", "name": "芝芝莓莓", "price": 25.0, "description": "草莓奶盖鲜滑浓厚，酸甜爽口"},
            {"id": "item_103", "name": "芝芝芒芒", "price": 25.0, "description": "新鲜芒果打底，芝士奶盖绵密香甜"},
        ],
    }
    return {"items": menus.get(shop_id, [])}
