# 定义前端可渲染的组件类型白名单
CATALOG = {
    "order_card",
    "counter",
    "button",
    "address_block",
    "text",
    "image",
}


def is_valid_component(component_type: str) -> bool:
    return component_type in CATALOG
