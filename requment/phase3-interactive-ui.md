# Phase 3.5 — 交互式生成式 UI

> 当前 Phase 3 已完成基础生成式 UI 渲染；本阶段目标是让卡片从"展示型"升级为"可操作型"，
> 用户直接在卡片上完成地址选择、店铺选择，无需通过文字输入。

---

## 一、新增能力概述

| 场景 | 当前行为 | 目标行为 |
|------|----------|----------|
| AI 询问地址 | 用户手动输入文字 | 弹出地图选址卡片，点击区域/输入确认 |
| AI 展示店铺列表 | 纯展示，用户手动回复店名 | 点击店铺卡片直接选中，触发菜单展示 |

---

## 二、功能设计

### 2.1 地图选址组件（address_picker）

**触发时机：**
- 后端新增 `request_location` 工具
- AI 在需要用户地址时调用此工具（替代直接问文字）
- 工具调用后端 emit `address_picker` A2UI Surface
- Surface 挂载到 AI 的文字回复气泡上一起展示

**组件交互：**
```
┌─────────────────────────────────┐
│  选择配送地址                    │
│                                 │
│  [南山] [福田] [宝安] [龙华]    │  ← 快捷区域 chip
│  [罗湖] [龙岗] [盐田] [光明]   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 输入详细地址...          │   │  ← 自由输入框
│  └─────────────────────────┘   │
│                    [确认选择]   │
└─────────────────────────────────┘
```

**数据流：**
1. 用户点击区域 chip → 填入输入框
2. 用户点击"确认选择" → 触发 `select_address` action，payload = 地址字符串
3. `Chat.tsx` 捕获 action → 调用 `handleSend(address)` 注入为用户消息
4. Agent 收到地址文字 → 继续调用 `search_nearby_shops`

**A2UI Schema：**
```json
{
  "type": "address_picker",
  "props": {
    "suggestions": ["南山", "福田", "宝安", "龙华", "罗湖", "龙岗"]
  }
}
```

---

### 2.2 可选择店铺列表（shop_item 交互升级）

**触发时机：**
- `search_nearby_shops` 工具返回后，emit `shop_list` Surface（已有）
- 升级：每个 `shop_item` 增加 `shop_id` prop，变为可点击卡片

**组件交互：**
```
┌─────────────────────────────────┐
│  附近店铺                        │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 瑞幸咖啡(XX店)     ★4.8 │   │  ← 点击整行选中
│  │ 300m                    │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 喜茶(XX店)         ★4.7 │   │  ← 悬浮高亮
│  │ 500m                    │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**数据流：**
1. 用户点击 shop_item → 触发 `select_shop` action，payload = `{ shopId, shopName }`
2. `Chat.tsx` 捕获 action → 调用 `handleSend("我选 {shopName}")` 注入为用户消息
3. Agent 收到选择 → 调用 `get_menu(shop_id=...)` → emit `menu_list` Surface

**A2UI Schema 变更（shop_item 增加 shop_id）：**
```json
{
  "type": "shop_item",
  "props": {
    "shop_id": "shop_001",
    "name": "瑞幸咖啡(XX店)",
    "rating": 4.8,
    "distance": "300m"
  }
}
```

---

## 三、实现计划

### Step 1 — 后端：新增 request_location 工具

**文件：** `backend/app/agent/tools/request_location.py`
```python
@tool
def request_location() -> dict:
    """当需要用户提供配送地址时调用此工具。调用后系统会自动弹出地址选择界面。"""
    return {"status": "waiting_for_location"}
```

**注册：** `backend/app/agent/tools/__init__.py`
```python
ALL_TOOLS = [request_location, search_nearby_shops, get_menu, create_order, call_payment]
```

**Agent 处理（`agent.py`）：**
```python
elif tc["name"] == "request_location":
    for a2ui_msg in build_address_picker_surface():
        yield sse(CustomEvent(...))
```

---

### Step 2 — 后端：address_picker Builder

**文件：** `backend/app/a2ui/builder.py`
```python
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
                props={"suggestions": suggestions}
            )
        ]),
    ]
```

---

### Step 3 — 后端：shop_item 增加 shop_id

**文件：** `backend/app/a2ui/builder.py`，`build_shop_list_surface` 中：
```python
props={
    "shop_id": shop.get("id", ""),   # 新增
    "name": shop.get("name", ""),
    "rating": shop.get("rating", 0),
    "distance": shop.get("distance", ""),
}
```

---

### Step 4 — 前端：AddressPicker 组件

**文件：** `frontend/src/components/a2ui/catalog/AddressPicker.tsx`

- 渲染 suggestions 为橙色 chip 按钮组
- 点击 chip → 填充 input
- input 支持自由输入
- "确认选择"按钮 → 触发 `onAction('select_address', inputValue)`

---

### Step 5 — 前端：ShopItem 升级为可点击

**文件：** `frontend/src/components/a2ui/catalog/ShopItem.tsx`

- 整行改为 `<button>` 或加 `onClick`
- 悬浮时背景色变化（`#fff7f0`）
- 点击触发 `onAction('select_shop', { shopId, shopName })`
- `onAction` 需从 `ComponentRenderer` 透传到 `ShopItem`

---

### Step 6 — 前端：ComponentRenderer 透传 onAction

**当前问题：** `ComponentRenderer` 的 `onAction` 类型是 `(action: string) => void`，
无法携带 payload（shop_id、地址字符串）。

**升级签名：**
```typescript
onAction?: (action: string, payload?: unknown) => void
```

涉及文件：`ComponentRenderer.tsx`、`SurfaceRenderer.tsx`、`MessageItem.tsx`、`Chat.tsx`

---

### Step 7 — 前端：Chat.tsx 处理新 action

```typescript
const handleAction = (action: string, payload?: unknown) => {
  if (action === 'select_address') {
    handleSend(payload as string)
  }
  if (action === 'select_shop') {
    const { shopName } = payload as { shopId: string; shopName: string }
    handleSend(`我选 ${shopName}`)
  }
  if (action === 'call_pay') { ... }
  if (action === 'open_map') { ... }
}
```

---

## 四、文件变更清单

### 后端（新增/修改）
| 文件 | 变更 |
|------|------|
| `agent/tools/request_location.py` | 新建 — `request_location` 工具 |
| `agent/tools/__init__.py` | 注册新工具 |
| `agent/agent.py` | 处理 `request_location` → emit address_picker A2UI |
| `a2ui/builder.py` | 新增 `build_address_picker_surface()`；shop_item 加 shop_id |

### 前端（新增/修改）
| 文件 | 变更 |
|------|------|
| `catalog/AddressPicker.tsx` | 新建 — 地图选址组件 |
| `catalog/ShopItem.tsx` | 升级为可点击，透传 onAction |
| `ComponentRenderer.tsx` | 注册 address_picker；onAction 签名加 payload |
| `SurfaceRenderer.tsx` | onAction 签名加 payload |
| `MessageItem.tsx` | onAction 签名加 payload |
| `Chat.tsx` | 处理 select_address / select_shop action |

---

## 五、完成验收标准

- [ ] 用户说"帮我点杯拿铁" → AI 调用 `request_location` → 聊天框内出现地址选择卡片
- [ ] 用户点击地区 chip（如"南山"）→ 填入输入框 → 点击确认 → 自动发送消息"南山"
- [ ] AI 调用 `search_nearby_shops` → 显示可点击店铺列表
- [ ] 用户点击店铺卡片 → 自动发送"我选瑞幸咖啡(XX店)" → AI 调用 `get_menu`
- [ ] 后续菜单展示、下单确认、支付流程不受影响
