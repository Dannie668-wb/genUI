from app.store import _sessions

MAX_TURNS = 10


async def get_history(session_id: str) -> list[dict]:
    return list(_sessions.get(session_id, []))


async def append_message(session_id: str, role: str, content: str):
    history = _sessions.get(session_id, [])
    history.append({"role": role, "content": content})
    if len(history) > MAX_TURNS * 2:
        history = history[-(MAX_TURNS * 2):]
    _sessions[session_id] = history


async def clear_session(session_id: str):
    _sessions.pop(session_id, None)
