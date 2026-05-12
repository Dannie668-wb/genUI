# 技术选型文档

> AI Agent 点餐系统技术方案

---

## 一、整体架构

```
用户输入（自然语言）
       ↓
  AI Agent（LLM 驱动 / DeepSeek）
  ├── 意图识别 + 实体提取（Function Calling）
  ├── 记忆管理（短期 + 长期）
  └── 工具调用编排（LangChain）
       ↓
  外部 API 工具层
  ├── 商家/菜单 API（美团/饿了么/高德）
  ├── 订单 API
  └── 支付 API（支付宝/微信）
       ↓
  AG-UI 事件流（SSE/WebSocket）
  ├── 文字消息事件（TextMessage*）
  ├── 工具调用事件（ToolCall*）
  └── A2UI Schema 事件（createSurface / updateComponents）
       ↓
  前端 React 渲染引擎（按 A2UI Catalog 映射组件）
       ↓
  用户确认 → 支付闭环
```

---

## 二、技术栈选型

### 2.1 后端

| 选项 | 说明 |
|------|------|
| **Python + FastAPI** | 推荐用于 MVP，AI 生态丰富，开发效率高 |
| Go | 高并发场景下性能更佳，适合生产环境 |

### 2.2 AI / Agent 框架

| 框架 | 说明 |
|------|------|
| **LangChain** | 成熟的 Agent + Tool Use 框架，社区生态好 |
| LlamaIndex | 擅长 RAG 场景，适合结合知识库检索 |
| Spring AI Alibaba | Java 生态选型，适合已有 Java 技术栈团队 |

### 2.3 大模型（LLM）

| 模型 | 说明 |
|------|------|
| **DeepSeek** | 选定模型，中文理解强，支持 Function Calling，性价比高 |

> 核心要求：模型必须支持 **Function Calling / Tool Use**

### 2.4 数据库

| 用途 | MVP 选型 | 生产选型 |
|------|----------|----------|
| 用户/订单数据 | **PostgreSQL** | PostgreSQL（分库分表） |
| 短期记忆（会话） | **Redis** | Redis Cluster |
| 长期记忆/用户画像 | **PostgreSQL** | 阿里云 Tablestore（混合存储+向量检索） |
| 向量搜索（偏好匹配） | pgvector 插件 | Tablestore / Milvus |

### 2.5 中间件

| 组件 | 用途 |
|------|------|
| **Redis** | 缓存、限流、短期记忆、Session 管理 |
| **RocketMQ / Kafka** | 异步处理高并发事件，用户行为数据流 |
| Nacos（可选） | 配置中心，管理熔断关键词等动态配置 |

### 2.6 第三方服务集成

| 类别 | 服务 |
|------|------|
| 地图/位置 | 高德开放平台 |
| 商家/外卖 | 美团开放平台 / 饿了么开放平台 / 淘宝闪购 API |
| 支付 | 支付宝 V3 接口 / 微信支付 V3 |

### 2.7 前端

| 层级 | 技术 | 用途 |
|------|------|------|
| **UI 框架** | React | 聊天界面主体、组件渲染 |
| **状态管理** | Zustand | 管理对话流、订单状态、用户偏好 |
| **交互协议** | AG-UI | Agent ↔ 前端标准事件协议（SSE/WebSocket），定义约16种事件类型 |
| **生成式 UI 规范** | A2UI | Google 开源的声明式 UI Schema 规范，Agent 描述界面结构，前端渲染 |
| **HTTP 客户端** | Axios | 普通接口调用（登录、历史记录等） |

### 2.8 协议说明

#### AG-UI（交互协议）

Agent 与前端通过事件流通信，事件分五类：

| 事件类别 | 说明 |
|----------|------|
| Lifecycle | `RunStarted` / `RunFinished` — Agent 任务生命周期 |
| Text Messages | `TextMessageStart` / `TextMessageContent` / `TextMessageEnd` — 流式文字输出 |
| Tool Calls | `ToolCallStart` / `ToolCallArgs` / `ToolCallEnd` — 工具调用过程推送 |
| State Management | `StateSnapshot` / `StateDelta` — 前后端共享状态同步（含冲突解决） |
| Special Events | 人工审批中断、自定义事件 |

#### A2UI（生成式 UI 规范）

Agent 生成 JSON 描述界面，采用**邻接表架构**（扁平列表 + ID 引用，支持流式分批到达）：

```json
// Agent 推送的消息类型
{ "type": "createSurface",     "surface": { "id": "order_card", ... } }
{ "type": "updateComponents",  "components": [ { "id": "c1", "type": "counter", "props": {...} } ] }
{ "type": "updateDataModel",   "path": "/order/items/0/count", "value": 2 }
{ "type": "deleteSurface",     "surfaceId": "order_card" }
```

组件属性通过 **JSON Pointer（RFC 6901）** 绑定数据模型，前端渲染引擎按照 Catalog（组件目录）映射为 React 组件。

---

## 三、关键技术点

### 3.1 Function Calling（工具调用）

大模型根据用户意图自动决策是否调用工具，工具以 JSON Schema 描述：

```json
{
  "name": "create_food_order",
  "description": "当用户想要点奶茶、咖啡或外卖时调用",
  "parameters": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "properties": {
            "name": { "type": "string" },
            "quantity": { "type": "integer" },
            "sugar": { "type": "string", "enum": ["无糖", "半糖", "正常"] },
            "ice": { "type": "string", "enum": ["去冰", "少冰", "正常"] }
          }
        }
      },
      "location": { "type": "string" }
    },
    "required": ["items"]
  }
}
```

### 3.2 记忆管理

- **短期记忆**：`Redis` Key `session:{session_id}`，存最近 N 轮对话
- **长期记忆**：`PostgreSQL` 存储用户画像（地址、口味偏好、常点品牌）
- **写入时机**：每次交互后异步写入（通过 MQ），离线提炼为长期记忆

### 3.3 生成式 UI Schema

后端返回标准 JSON Schema，前端解析渲染：

```json
{
  "type": "confirm_order_card",
  "data": {
    "shop_name": "瑞幸咖啡(XX店)",
    "items": [
      {
        "type": "horizontal_counter",
        "props": { "name": "生椰拿铁", "price": 18, "count": 2, "image": "url" }
      }
    ],
    "actions": [
      { "type": "button", "props": { "text": "修改地址", "style": "link", "action": "open_map" } },
      { "type": "button", "props": { "text": "确认支付", "style": "primary", "action": "call_pay" } }
    ]
  }
}
```

### 3.4 熔断降级（智商熔断）

- 监控实时 QPS；超阈值时对触发关键词请求直接返回静态降级响应
- 不调用 LLM、不查询订单库，保住后端服务稳定

---

## 四、MVP vs 生产选型对比

| 维度 | MVP | 生产 |
|------|-----|------|
| 后端 | Python + FastAPI | Go 或 Java（高并发） |
| LLM | DeepSeek | 同，加速推理优化 |
| 记忆存储 | PostgreSQL + Redis | Tablestore + Redis Cluster |
| 消息队列 | 无 / 简单队列 | RocketMQ / Kafka |
| 熔断 | 简单计数器 | 网关层关键词熔断 + 配置中心 |
| 商家 API | 模拟数据 | 真实开放平台接口 |
| 支付 | Mock | 支付宝/微信 V3 正式接口 |
