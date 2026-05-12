from app.store import _profiles


async def get_user_profile(user_id: str) -> dict:
    return dict(_profiles.get(user_id, {}))


async def update_user_profile(user_id: str, updates: dict):
    profile = _profiles.get(user_id, {})
    _profiles[user_id] = {**profile, **updates}


def build_memory_prompt(profile: dict) -> str:
    if not profile:
        return ""
    parts = []
    if addr := profile.get("default_address"):
        parts.append(f"默认地址：{addr}")
    if flavor := profile.get("flavor"):
        parts.append(f"口味偏好：{flavor}")
    if brand := profile.get("brand"):
        parts.append(f"常点品牌：{brand}")
    return "用户偏好：" + "，".join(parts) if parts else ""
