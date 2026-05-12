from langchain_core.tools import tool


@tool
def call_payment(order_id: str, total: float) -> dict:
    """发起支付。返回支付参数供前端唤起支付界面。"""
    # Mock：Phase 5 替换为真实支付宝/微信 V3 接口
    return {
        "order_id": order_id,
        "payment_id": f"pay_{order_id}",
        "amount": total,
        "status": "awaiting_confirmation",
    }
