from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from ag_ui.core import RunAgentInput
from ag_ui.encoder import EventEncoder
from app.agent.agent import run_agent
from app.memory.long_term import get_user_profile, build_memory_prompt

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/stream")
async def chat_stream(req: RunAgentInput, request: Request):
    thread_id = req.thread_id
    run_id = req.run_id

    user_input = str(req.messages[-1].content) if req.messages else ""

    forwarded = req.forwarded_props or {}
    user_id = str(forwarded.get("userId", thread_id))
    shop_id = str(forwarded.get("shopId", "")) or None

    profile = await get_user_profile(user_id)
    memory_hint = build_memory_prompt(profile)

    accept = request.headers.get("accept", "text/event-stream")
    encoder = EventEncoder(accept=accept)

    async def event_stream():
        async for chunk in run_agent(user_input, thread_id, run_id, memory_hint, shop_id=shop_id):
            yield chunk

    return StreamingResponse(event_stream(), media_type=encoder.get_content_type())
