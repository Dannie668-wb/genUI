from app.a2ui.types import CreateSurface, UpdateComponents, A2UIComponent, A2UIMessage
import uuid


def build_address_picker_surface() -> list[A2UIMessage]:
    surface_id = f"addr_picker_{uuid.uuid4().hex[:8]}"
    suggestions = ["南山", "福田", "宝安", "龙华", "罗湖", "龙岗", "盐田", "光明"]
    picker_id = "address_picker_0"
    return [
        CreateSurface(surface={"id": surface_id, "root": picker_id}),
        UpdateComponents(components=[
            A2UIComponent(
                id=picker_id,
                type="address_picker",
                props={"suggestions": suggestions},
            )
        ]),
    ]


def build_shop_list_surface(shops: list) -> list[A2UIMessage]:
    surface_id = f"shops_{uuid.uuid4().hex[:8]}"
    components = []
    shop_ids = []
    for i, shop in enumerate(shops):
        cid = f"shop_item_{i}"
        shop_ids.append(cid)
        components.append(A2UIComponent(
            id=cid,
            type="shop_item",
            props={
                "shop_id": shop.get("id", ""),
                "name": shop.get("name", ""),
                "rating": shop.get("rating", 0),
                "distance": shop.get("distance", ""),
            }
        ))
    list_id = "shop_list_0"
    components.append(A2UIComponent(id=list_id, type="shop_list", props={}, children=shop_ids))
    return [
        CreateSurface(surface={"id": surface_id, "root": list_id}),
        UpdateComponents(components=components),
    ]


def build_menu_surface(items: list) -> list[A2UIMessage]:
    surface_id = f"menu_{uuid.uuid4().hex[:8]}"
    components = []
    item_ids = []
    for i, item in enumerate(items):
        cid = f"menu_item_{i}"
        item_ids.append(cid)
        components.append(A2UIComponent(
            id=cid,
            type="menu_item",
            props={
                "name": item.get("name", ""),
                "price": item.get("price", 0),
                "description": item.get("description", ""),
            }
        ))
    list_id = "menu_list_0"
    components.append(A2UIComponent(id=list_id, type="menu_list", props={}, children=item_ids))
    return [
        CreateSurface(surface={"id": surface_id, "root": list_id}),
        UpdateComponents(components=components),
    ]


def build_order_confirm_surface(order_data: dict) -> list[A2UIMessage]:
    surface_id = f"order_{uuid.uuid4().hex[:8]}"
    items = order_data.get("items", [])

    item_ids = []
    components = []
    for i, item in enumerate(items):
        cid = f"counter_{i}"
        item_ids.append(cid)
        components.append(A2UIComponent(
            id=cid,
            type="counter",
            props={
                "name": item.get("name", ""),
                "price": item.get("price", 0),
                "count": item.get("quantity", 1),
                "image": item.get("image", ""),
            }
        ))

    addr_id = "address_block_0"
    components.append(A2UIComponent(
        id=addr_id,
        type="address_block",
        props={"address": order_data.get("address", "")}
    ))

    btn_modify = "btn_modify_address"
    btn_pay = "btn_pay"
    components.extend([
        A2UIComponent(id=btn_modify, type="button",
                      props={"text": "修改地址", "style": "link", "action": "open_map"}),
        A2UIComponent(id=btn_pay, type="button",
                      props={"text": "确认支付", "style": "primary", "action": "call_pay"}),
    ])

    card_id = "order_card_0"
    components.append(A2UIComponent(
        id=card_id,
        type="order_card",
        props={
            "shop_name": order_data.get("shop_name", ""),
            "total": order_data.get("total", 0),
        },
        children=item_ids + [addr_id, btn_modify, btn_pay]
    ))

    return [
        CreateSurface(surface={"id": surface_id, "root": card_id}),
        UpdateComponents(components=components),
    ]
