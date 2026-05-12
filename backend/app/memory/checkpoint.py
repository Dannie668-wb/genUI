import json
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from app.redis import get_redis

_TTL = 60 * 60 * 24  # 24h
_fallback: dict[str, list] = {}


def _key(thread_id: str) -> str:
    return f"checkpoint:{thread_id}"


def _serialize(messages: list[BaseMessage]) -> list[dict]:
    out = []
    for m in messages:
        if isinstance(m, HumanMessage):
            out.append({"type": "human", "content": m.content})
        elif isinstance(m, AIMessage):
            out.append({
                "type": "ai",
                "content": m.content or "",
                "tool_calls": m.tool_calls or [],
            })
        elif isinstance(m, ToolMessage):
            out.append({
                "type": "tool",
                "content": m.content,
                "tool_call_id": m.tool_call_id,
            })
    return out


def _deserialize(data: list[dict]) -> list[BaseMessage]:
    out = []
    for item in data:
        t = item["type"]
        if t == "human":
            out.append(HumanMessage(content=item["content"]))
        elif t == "ai":
            msg = AIMessage(content=item.get("content", ""))
            if item.get("tool_calls"):
                msg.tool_calls = item["tool_calls"]
            out.append(msg)
        elif t == "tool":
            out.append(ToolMessage(
                content=item["content"],
                tool_call_id=item["tool_call_id"],
            ))
    return out


async def load_messages(thread_id: str) -> list[BaseMessage]:
    try:
        redis = await get_redis()
        raw = await redis.get(_key(thread_id))
        if raw:
            return _deserialize(json.loads(raw))
        return []
    except Exception:
        return _deserialize(_fallback.get(thread_id, []))


async def save_messages(thread_id: str, messages: list[BaseMessage]) -> None:
    data = _serialize(messages)
    try:
        redis = await get_redis()
        await redis.set(_key(thread_id), json.dumps(data, ensure_ascii=False), ex=_TTL)
    except Exception:
        _fallback[thread_id] = data
