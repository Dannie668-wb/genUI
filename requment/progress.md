生成式UI的流程图式什么样的                                                                          

     │
     ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  Frontend: Chat.tsx                                             │
  │  handleSend(text) → addUserMessage + createAGUIStream          │                      
  └─────────────────────────┬───────────────────────────────────────┘
                            │ POST /chat/stream (SSE)
                            ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  Backend: run_agent()                                           │
  │                                                                 │
  │  ① yield RunStarted                                            │
  │                                                                 │
  │  ② LLM.ainvoke(messages)                                      │
  │       │                                                         │
  │       ├─ 有 tool_calls ──────────────────────────────────┐     │
  │       │                                                   │     │
  │       │  ③ yield ToolCallStart / ToolCallArgs            │     │
  │       │     tool.ainvoke(args)                           │     │
  │       │     yield ToolCallEnd                            │     │
  │       │                                                   │     │
  │       │  ④ 按工具名 emit A2UI ──────────────────────┐   │     │
  │       │     request_location → address_picker surface │   │     │
  │       │     search_shops     → shop_list surface      │   │     │
  │       │     get_menu         → menu_list surface      │   │     │
  │       │     create_order     → order_card surface     │   │     │
  │       │                       │                        │   │     │
  │       │     yield CustomEvent(createSurface)  ◄────────┘   │     │
  │       │     yield CustomEvent(updateComponents)             │     │
  │       │                                                   │     │
  │       │  ⑤ LLM.ainvoke(messages + tool results) ◄────────┘     │
  │       │                                                         │
  │       └─ 无 tool_calls（最终回复）                              │
  │              yield TextMessageStart                             │
  │              yield TextMessageContent                           │
  │              yield TextMessageEnd                               │
  │                                                                 │
  │  ⑥ yield RunFinished                                           │
  └─────────────────────────┬───────────────────────────────────────┘
                            │ SSE 事件流
                            ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  Frontend: handleAGUIEvent()                                    │
  │                                                                 │
  │  RunStarted        → chat.setRunning(true)                     │
  │                                                                 │
  │  ToolCallStart     → chat.setToolCall(name, 'running')         │
  │  ToolCallEnd       → chat.setToolCall('', 'idle')              │
  │                                                                 │
  │  Custom(a2ui)      → a2ui.dispatch(msg)          ← createSurface
  │    type=createSurface → a2ui store: surfaces[id] = {}          │
  │    type=updateComponents → surfaces[id].components = {...}     │
  │    ★ createSurface 时额外: chat.setPendingSurface(surfaceId)   │
  │                                                                 │
  │  TextMessageStart  → chat.startMessage(msgId)                  │
  │                       └─ 自动取 pendingSurfaceId               │
  │                          message = { id, content:'',           │
  │                                      surfaceId: pending }      │
  │                          pendingSurfaceId = null               │
  │                                                                 │
  │  TextMessageContent → chat.appendDelta(msgId, delta)           │
  │  RunFinished        → chat.setRunning(false)                   │
  └─────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  UI 渲染层                                                      │
  │                                                                 │
  │  MessageList                                                    │
  │    └─ MessageItem (role=assistant)                             │
  │         ├─ <span>{message.content}</span>   ← 文字气泡         │
  │         └─ <SurfaceRenderer surfaceId={...}>                  │
  │               └─ ComponentRenderer(rootComponent)              │
  │                    ├─ address_picker → <AddressPicker>         │
  │                    │     点击确认 → onAction('select_address') │
  │                    ├─ shop_list → <ShopList>                   │
  │                    │   └─ shop_item → <ShopItem>  (可点击)     │
  │                    │         点击 → onAction('select_shop')    │
  │                    ├─ menu_list → <MenuList>                   │
  │                    │   └─ menu_item → <MenuItem>               │
  │                    └─ order_card → <OrderCard>                 │
  │                         ├─ counter → <Counter>                 │
  │                         ├─ address_block → <AddressBlock>      │
  │                         └─ button → <Button>                   │
  │                               → onAction('call_pay')           │
  └─────────────────────────┬───────────────────────────────────────┘
                            │ onAction 回调
                            ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  Chat.tsx: handleAction(action, payload)                        │
  │                                                                 │
  │  'select_address' → handleSend(payload)      ← 重新进入顶部    │
  │  'select_shop'    → handleSend("我选{name}") ←                │
  │  'call_pay'       → setOrder + showPaymentModal                │
  │  'open_map'       → navigate('/settings')                      │
  └─────────────────────────────────────────────────────────────────┘

  核心设计模式：pending surface

  A2UI CustomEvent 到达          TextMessageStart 到达
          │                              │
          ▼                              ▼
  setPendingSurface(id)  ──────►  startMessage(msgId)
                                    surfaceId = pendingSurfaceId
                                    pendingSurfaceId = null

  A2UI 事件总是在文字消息之前到达（工具执行 → A2UI → LLM 文字回复），通过 pendingSurfaceId
  暂存，等文字消息开始时自动绑定，让卡片和文字出现在同一条消息气泡里。

✻ Worked for 47s

                            │ onAction 回调
                            ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  Chat.tsx: handleAction(action, payload)                        │
  │                                                                 │
  │  'select_address' → handleSend(payload)      ← 重新进入顶部    │
  │  'select_shop'    → handleSend("我选{name}") ←                │
  │  'call_pay'       → setOrder + showPaymentModal                │
  │  'open_map'       → navigate('/settings')                      │
  └─────────────────────────────────────────────────────────────────┘

  核心设计模式：pending surface

  A2UI CustomEvent 到达          TextMessageStart 到达
          │                              │
          ▼                              ▼
  setPendingSurface(id)  ──────►  startMessage(msgId)
                                    surfaceId = pendingSurfaceId
                                    pendingSurfaceId = null

  A2UI 事件总是在文字消息之前到达（工具执行 → A2UI → LLM 文字回复），通过 pendingSurfaceId
  暂存，等文字消息开始时自动绑定，让卡片和文字出现在同一条消息气泡里。