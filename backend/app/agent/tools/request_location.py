from langchain_core.tools import tool


@tool
def request_location() -> dict:
    """当需要用户提供配送地址时调用此工具。调用后系统会自动弹出地址选择界面，无需在文字中询问地址。"""
    return {"status": "waiting_for_location"}
