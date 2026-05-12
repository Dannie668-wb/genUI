import json
from typing import AsyncGenerator
from app.agui.types import AGUIEvent


async def sse_format(event: AGUIEvent) -> str:
    return f"data: {event.model_dump_json()}\n\n"


async def emit_events(events: list[AGUIEvent]) -> AsyncGenerator[str, None]:
    for event in events:
        yield await sse_format(event)
