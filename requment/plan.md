# 分阶段开发计划

> AI Agent 点餐系统 — MVP 路线
>
> **说明：** 外部 API（地图、外卖平台、支付）及基础设施（Redis、PostgreSQL）均采用 **Mock 内存模式**，无需真实服务即可完整运行。

---

## 代码结构

### 后端（Python + FastAPI）

```
backend/
├── app/
│   ├── main.py                  # FastAPI 入口，注册路由
│   ├── config.py                # 环境变量加载（pydantic-settings）
│   ├── store.py                 # 全局内存存储（Mock: sessions/profiles/orders/ws）
│   ├── database.py              # PostgreSQL 连接（保留，Mock 模式下不使用）
│   ├── redis.py                 # Redis 连接（保留，Mock 模式下不使用）
│   │
│   ├── api/                     # 路由层
│   │   ├── chat.py              # /chat SSE 端点（AG-UI 事件流）
│   │   ├── order.py             # /order 订单 CRUD（内存存储）
│   │   ├── user.py              # /user 用户偏好接口
│   │   └── payment.py           # /payment webhook + WebSocket 通知
│   │
│   ├── agent/                   # Agent 核心
│   │   ├── agent.py             # LangChain Agent 入口，编排工具调用
│   │   ├── tools/               # Function Calling 工具定义（全部 Mock 数据）
│   │   │   ├── search_shops.py  # search_nearby_shops 工具（Mock）
│   │   │   ├── get_menu.py      # get_menu 工具（Mock）
│   │   │   ├── create_order.py  # create_order 工具（Mock + 写入内存存储）
│   │   │   └── call_payment.py  # call_payment 工具（Mock）
│   │   └── prompt.py            # System Prompt 模板，注入用户画像
│   │
│   ├── agui/                    # AG-UI 协议封装
│   │   ├── emitter.py           # 事件发射器
│   │   └── types.py             # AG-UI 事件类型定义
│   │
│   ├── a2ui/                    # A2UI 生成式 UI
│   │   ├── catalog.py           # 组件 Catalog 定义
│   │   ├── builder.py           # 根据订单数据生成 A2UI Schema
│   │   └── types.py             # A2UI 消息类型
│   │
│   ├── memory/                  # 记忆系统
│   │   ├── short_term.py        # 会话上下文（内存 dict，Key: session_id）
│   │   └── long_term.py         # 用户画像读写（内存 dict）
│   │
│   ├── models/                  # 数据库模型（SQLAlchemy ORM，备用）
│   │   ├── user.py
│   │   ├── session.py
│   │   └── order.py
│   │
│   └── services/                # 外部服务封装（预留，当前由 Mock 工具替代）
│       ├── map.py
│       ├── shop.py
│       └── payment.py
│
├── tests/
├── .venv/
├── .env
├── requirements.txt
└── Dockerfile
```

### 前端（React + Vite + TypeScript）

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── pages/
│   │   ├── Chat.tsx             # 聊天主页
│   │   ├── Onboarding.tsx       # 首次使用引导
│   │   ├── Settings.tsx         # 用户偏好设置页
│   │   └── OrderStatus.tsx      # 订单状态追踪（WebSocket 实时更新）
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── InputBar.tsx
│   │   │   ├── ToolCallBadge.tsx
│   │   │   └── PaymentModal.tsx
│   │   │
│   │   └── a2ui/
│   │       ├── SurfaceRenderer.tsx
│   │       ├── ComponentRenderer.tsx
│   │       └── catalog/
│   │           ├── Counter.tsx
│   │           ├── Button.tsx
│   │           ├── OrderCard.tsx
│   │           └── AddressBlock.tsx
│   │
│   ├── store/
│   │   ├── chatStore.ts
│   │   ├── orderStore.ts
│   │   └── userStore.ts
│   │
│   ├── lib/
│   │   ├── agui/
│   │   │   ├── client.ts
│   │   │   └── eventHandler.ts
│   │   ├── axios.ts
│   │   └── a2ui/
│   │       └── reducer.ts
│   │
│   └── types/
│       ├── agui.ts
│       ├── a2ui.ts
│       └── order.ts
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Phase 1 — 项目初始化与基础框架搭建

**目标：** 前后端工程跑通，建立开发规范

### 后端
- [x] 创建 venv 虚拟环境（`python -m venv .venv`），`.venv/` 加入 `.gitignore`
- [x] 初始化 Python 项目（FastAPI + 目录结构）
- [x] 配置环境变量管理（`.env` + `pydantic-settings`）
- [x] 接入 DeepSeek API，验证基础调用（通过 `langchain-openai` ChatOpenAI 接口）
- [x] 定义基础数据模型：User、Session、Order（SQLAlchemy ORM，备用）
- [x] **Mock 模式：** `store.py` 统一内存存储，替代 Redis/PostgreSQL 依赖

### 前端
- [x] 初始化 React 项目（Vite + TypeScript）
- [x] 集成 Zustand（定义 chatStore、orderStore、userStore）
- [x] 集成 Axios，封装请求拦截器（统一 token、错误处理）
- [x] SSE 客户端封装（AG-UI 流式解析）
- [x] 搭建基础页面路由（聊天主页 / 设置页 / 订单页）

---

## Phase 2 — Agent 核心：意图识别与工具调用

**目标：** 自然语言 → 结构化指令 → 工具自动调用链路跑通

### 后端
- [x] 集成 LangChain，配置 Agent 基础结构（`ChatOpenAI.bind_tools`）
- [x] 定义 Function Calling 工具 Schema（全部 Mock 数据）：
  - `search_nearby_shops`（Mock 店铺列表）
  - `get_menu`（Mock 菜单数据）
  - `create_order`（Mock 下单，写入内存存储）
  - `call_payment`（Mock 支付参数）
- [x] 实现 Agent 路由：用户输入 → LLM 判断 → 工具调用 → 结果返回
- [x] 实体提取：商品名、数量、冰度、糖度、地址通过 LLM 自动提取
- [x] 按 **AG-UI 协议**封装事件推送：`RunStarted`、`TextMessage*`、`ToolCall*`、`RunFinished`
- [x] SSE 端点 `POST /chat/stream` 输出标准 AG-UI 事件流

### 前端
- [x] 聊天界面基础布局（消息列表 + 输入框）
- [x] 接入 AG-UI 客户端，解析事件流并驱动 UI 更新
- [x] 实现流式文字渲染（`TextMessageContent` 事件 → 打字机效果）
- [x] 工具调用状态展示（`ToolCallStart/End` 事件 → Loading 指示）
- [x] Zustand chatStore：管理消息历史、AG-UI 运行状态
- [x] Axios 封装非流式接口调用

---

## Phase 3 — 生成式 UI：Schema 渲染引擎

**目标：** 后端返回 JSON Schema，前端动态渲染可交互卡片

### 后端
- [x] 按 **A2UI 规范**定义组件 Catalog（counter / button / order_card / address_block）
- [x] Agent 在 `create_order` 工具调用后生成 A2UI Schema：
  - `createSurface` — 创建订单确认卡片 Surface
  - `updateComponents` — 填充商品列表、价格、地址等组件
- [x] 将 A2UI 消息包装为 AG-UI `Custom` 事件，随事件流推送前端

### 前端
- [x] 实现 **A2UI 渲染引擎**（按 Catalog 将组件类型映射为 React 组件）
- [x] 支持 A2UI 消息类型：`createSurface` / `updateComponents` / `updateDataModel` / `deleteSurface`
- [x] 实现 Catalog 组件：`counter`、`button`、`order_card`、`address_block`
- [x] 聊天消息流中嵌入渲染 Surface（文字消息 + 卡片混排）
- [x] 卡片 action 事件处理（修改地址 → 设置页，确认支付 → PaymentModal）

---

## Phase 4 — 记忆系统与个性化

**目标：** 用户偏好持久化，会话上下文注入

### 后端
- [x] 短期记忆：内存 dict 存储会话上下文（最近 10 轮，Key: `session_id`）
- [x] 长期记忆：内存 dict 存储用户画像（地址、口味偏好、常点品牌）
- [x] 会话启动时加载用户画像，注入 System Prompt
- [x] 每次偏好修改后通过 `PUT /user/preferences` 更新

### 前端
- [x] 首次使用引导：Onboarding 页收集默认地址和口味偏好
- [x] 个人设置页：查看和修改已保存偏好（Settings 页）
- [x] 偏好变更通过 Axios 同步后端

---

## Phase 5 — 支付闭环

**目标：** 应用内完成下单到付款全流程（Mock 模式）

### 后端
- [x] Mock 支付流程：`call_payment` 工具返回支付参数，直接模拟支付确认
- [x] 支付回调 `POST /payment/webhook`：更新订单状态，触发配送模拟
- [x] **WebSocket** `ws://localhost:8000/payment/ws/{session_id}`：推送配送状态变更
  - 支付成功后 3s 推送 `delivering`
  - 再 8s 推送 `delivered`

### 前端
- [x] 卡片内"确认支付"按钮触发支付流程（PaymentModal）
- [x] 支付状态展示（处理中 / 成功 / 失败）
- [x] 订单状态追踪页接入 WebSocket，实时更新进度条（待接单 → 已支付 → 配送中 → 已送达）
- [x] Zustand orderStore 管理订单状态

---

## Phase 6 — 外部 API（Mock 已完成，真实对接待定）

> MVP 阶段使用内置 Mock 数据，完整覆盖业务流程。真实 API 对接作为后续迭代。

| 功能 | Mock 实现 | 真实 API |
|------|-----------|---------|
| 附近店铺搜索 | `search_nearby_shops` 返回固定 2 家店 | 高德开放平台 |
| 菜单/商品数据 | `get_menu` 返回固定菜单 | 美团/饿了么开放平台 |
| 下单 | `create_order` 生成本地订单 | 美团/饿了么下单接口 |
| 支付 | `call_payment` + webhook 模拟 | 支付宝/微信支付 V3 |

- [ ] 对接高德开放平台（获取用户位置、附近商家）
- [ ] 对接美团/饿了么开放平台（菜单、下单）
- [ ] 对接支付宝/微信支付 V3 接口（沙箱环境）
- [ ] 统一外部 API 异常处理与重试机制
- [ ] 接口鉴权与 Token 管理

---

## Phase 7 — 稳定性与性能优化

**目标：** 高并发保障，系统可用性提升

### 后端
- [ ] Redis 限流（令牌桶，单用户 QPS 上限）
- [ ] 关键词熔断降级（超负载时直接返回静态响应，不调用 LLM）
- [ ] 引入消息队列（RocketMQ / Kafka）异步处理用户行为事件
- [ ] JMeter 压力测试，定位瓶颈
- [ ] 接口响应时间监控，Agent 响应控制在 5s 以内

### 前端
- [ ] 请求超时处理与错误提示
- [ ] WebSocket 断线重连与消息补偿
- [ ] 骨架屏 / Loading 状态优化体验

---

## 里程碑总览

| 阶段 | 交付物 | 状态 |
|------|--------|------|
| Phase 1 | 工程骨架 | ✅ 完成（Mock 内存存储） |
| Phase 2 | Agent 链路 | ✅ 完成（Mock 工具数据） |
| Phase 3 | 生成式 UI | ✅ 完成 |
| Phase 4 | 记忆系统 | ✅ 完成（内存存储） |
| Phase 5 | 支付闭环 | ✅ 完成（Mock + WebSocket 推送） |
| Phase 6 | 真实 API 对接 | ⏳ 待定（Mock 已完成） |
| Phase 7 | 稳定性 | ⏳ 待实现 |
