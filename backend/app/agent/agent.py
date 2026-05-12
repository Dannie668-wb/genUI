from typing import AsyncGenerator
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage
from app.config import settings
from app.agent.tools import ALL_TOOLS
from app.agent.prompt import build_system_prompt
from app.memory.checkpoint import load_messages, save_messages
from ag_ui.core import (
    EventType,
    RunStartedEvent, RunFinishedEvent, RunErrorEvent,
    TextMessageStartEvent, TextMessageContentEvent, TextMessageEndEvent,
    ToolCallStartEvent, ToolCallArgsEvent, ToolCallEndEvent,
    CustomEvent,
)
from ag_ui.encoder import EventEncoder
from app.a2ui.builder import (
    build_address_picker_surface,
    build_shop_list_surface,
    build_menu_surface,
    build_order_confirm_surface,
)
import uuid
import json


def _build_llm():
    return ChatOpenAI(
        model=settings.deepseek_model,
        api_key=settings.deepseek_api_key,
        base_url=settings.deepseek_base_url,
    ).bind_tools(ALL_TOOLS)


async def run_agent(
    user_input: str,
    thread_id: str,
    run_id: str,
    memory_hint: str = "",
    shop_id: str | None = None,
) -> AsyncGenerator[str, None]:
    llm = _build_llm()
    encoder = EventEncoder()

    # 从 checkpoint 加载历史（含 tool_calls / ToolMessage）
    history = await load_messages(thread_id)

    system_prompt = build_system_prompt(memory_hint)

    # shop_id 由前端通过 forwardedProps 传入，仅注入本轮上下文，不存 checkpoint
    context_note = (
        [SystemMessage(content=f"[系统注：用户通过界面选择了店铺，shop_id={shop_id}，请立即调用 get_menu 获取菜单]")]
        if shop_id else []
    )
    messages = [SystemMessage(content=system_prompt)] + history + context_note + [HumanMessage(content=user_input)]

    # checkpoint 里只存非 system 消息（不含 context_note）
    checkpoint_messages = history + [HumanMessage(content=user_input)]

    msg_id = uuid.uuid4().hex

    def sse(event) -> str:
        return encoder.encode(event)

    yield sse(RunStartedEvent(type=EventType.RUN_STARTED, thread_id=thread_id, run_id=run_id))

    try:
        response = await llm.ainvoke(messages)

        while response.tool_calls:
            ai_msg = AIMessage(content=response.content or "", tool_calls=response.tool_calls)
            messages.append(ai_msg)
            checkpoint_messages.append(ai_msg)

            for tc in response.tool_calls:
                tc_id = tc["id"]
                yield sse(ToolCallStartEvent(
                    type=EventType.TOOL_CALL_START,
                    tool_call_id=tc_id,
                    tool_call_name=tc["name"],
                ))
                yield sse(ToolCallArgsEvent(
                    type=EventType.TOOL_CALL_ARGS,
                    tool_call_id=tc_id,
                    delta=json.dumps(tc["args"], ensure_ascii=False),
                ))

                tool_map = {t.name: t for t in ALL_TOOLS}
                tool_result = await tool_map[tc["name"]].ainvoke(tc["args"])
                yield sse(ToolCallEndEvent(type=EventType.TOOL_CALL_END, tool_call_id=tc_id))

                if tc["name"] == "request_location":
                    for a2ui_msg in build_address_picker_surface():
                        yield sse(CustomEvent(type=EventType.CUSTOM, name="a2ui", value=a2ui_msg.model_dump()))
                elif tc["name"] == "search_nearby_shops" and isinstance(tool_result, dict):
                    shops = tool_result.get("shops", [])
                    if shops:
                        for a2ui_msg in build_shop_list_surface(shops):
                            yield sse(CustomEvent(type=EventType.CUSTOM, name="a2ui", value=a2ui_msg.model_dump()))
                elif tc["name"] == "get_menu" and isinstance(tool_result, dict):
                    items = tool_result.get("items", [])
                    if items:
                        for a2ui_msg in build_menu_surface(items):
                            yield sse(CustomEvent(type=EventType.CUSTOM, name="a2ui", value=a2ui_msg.model_dump()))
                elif tc["name"] == "create_order" and isinstance(tool_result, dict):
                    for a2ui_msg in build_order_confirm_surface(tool_result):
                        yield sse(CustomEvent(type=EventType.CUSTOM, name="a2ui", value=a2ui_msg.model_dump()))

                tool_msg = ToolMessage(
                    content=json.dumps(tool_result, ensure_ascii=False),
                    tool_call_id=tc_id,
                )
                messages.append(tool_msg)
                checkpoint_messages.append(tool_msg)

            response = await llm.ainvoke(messages)

        if response.content:
            yield sse(TextMessageStartEvent(
                type=EventType.TEXT_MESSAGE_START,
                message_id=msg_id,
                role="assistant",
            ))
            yield sse(TextMessageContentEvent(
                type=EventType.TEXT_MESSAGE_CONTENT,
                message_id=msg_id,
                delta=response.content,
            ))
            yield sse(TextMessageEndEvent(type=EventType.TEXT_MESSAGE_END, message_id=msg_id))
            checkpoint_messages.append(AIMessage(content=response.content))

        await save_messages(thread_id, checkpoint_messages)

        yield sse(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id=thread_id, run_id=run_id))

    except Exception as e:
        yield sse(RunErrorEvent(type=EventType.RUN_ERROR, message=str(e)))
