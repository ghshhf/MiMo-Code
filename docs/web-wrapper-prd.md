# Web Wrapper — 产品需求文档 (PRD)

## 项目信息

- **项目名称**: web_wrapper
- **编程语言**: TypeScript / Node.js
- **技术栈**: Playwright (浏览器自动化), Hono (HTTP 服务), Vercel AI SDK 兼容接口
- **项目位置**: `packages/web-wrapper/` (monorepo 新 package)
- **目标平台**: 免费网页 AI 聊天界面（首个目标：DeepSeek Web）
- **原始需求**: 创建一个中间层服务，通过 Playwright 操作免费 AI 网页聊天界面，将这些网页的对话能力暴露为 OpenAI 兼容的 API 接口，使 MiMo-Code 的 provider 系统可以像使用普通 API 一样使用这些免费网页模型。网页模型只负责文本生成/思考，MiMo-Code Agent 负责工具调用。

---

## 1. 产品定义

### 1.1 产品目标 (Product Goals)

| # | 目标 | 说明 |
|---|------|------|
| G1 | **零成本推理接入** | 利用免费网页 AI 的对话能力（如 DeepSeek Web），为零预算或评估场景提供 AI 模型接入能力，降低使用门槛 |
| G2 | **无感 API 兼容** | 对外暴露标准的 `/v1/chat/completions` OpenAI 兼容 API，使 MiMo-Code 现有 provider 系统无需修改即可无缝对接 |
| G3 | **专注文本生成，工具调用由 Agent 负责** | 网页模型仅负责"思考"和"文本生成"，不负责工具调用执行。MiMo-Code Agent 系统处理所有工具调用（文件读写、bash、LSP 等），通过消息循环将工具结果回传给网页模型继续推理 |

### 1.2 用户故事 (User Stories)

| ID | 用户故事 |
|----|----------|
| US-01 | 作为 **MiMo-Code 用户**，我想要配置一个"免费网页版 DeepSeek"作为 provider，这样我不需要付费 API Key 就能使用 DeepSeek 的推理能力 |
| US-02 | 作为 **开发者**，我想通过标准的 OpenAI `/v1/chat/completions` 接口调用网页模型，这样我的现有工具链和代码无需任何适配即可工作 |
| US-03 | 作为 **MiMo-Code Agent 用户**，我希望 Agent 工具调用后，网页模型能"看到"工具执行结果并继续推理，这样完整的 Agent 工作流（思考→调用工具→分析结果→继续）可以正常运作 |
| US-04 | 作为 **开发者**，我期望 Web Wrapper 支持流式输出 (SSE)，这样我能在 UI 上实时看到模型的思考和回复过程 |
| US-05 | 作为 **高级用户**，我希望能配置多个网页 AI 源（DeepSeek Web、Kimi、智谱清言等），这样我可以在不同场景下切换使用不同的免费模型 |
| US-06 | 作为 **运维/开发者**，我需要 Web Wrapper 能自动维持会话状态（登录 cookie、对话上下文），这样多轮对话和长会话不会中断 |
| US-07 | 作为 **使用者**，我希望配置过程尽可能简单 — 启动服务、登录一次、后续自动复用会话，这样我不需要每次重启都重新登录 |

---

## 2. 技术规范

### 2.1 需求池 (Requirement Pool)

#### P0 — 必须有 (Must Have)

| ID | 需求 | 说明 | 涉及用户故事 |
|----|------|------|-------------|
| R-01 | **OpenAI 兼容 API** | 暴露 `/v1/chat/completions` 端点，支持 `POST` 请求，`messages`、`model`、`stream`、`temperature` 等标准参数 | US-01, US-02 |
| R-02 | **流式输出 (SSE)** | 当 `stream: true` 时使用 `text/event-stream` 返回增量内容，格式与 OpenAI SSE 兼容 | US-04 |
| R-03 | **非流式输出** | 当 `stream: false` 时完整返回生成内容 | US-02 |
| R-04 | **Playwright 浏览器自动化** | 使用 Playwright 启动/管理浏览器实例，操作 DeepSeek Web 的对话界面 | US-01 |
| R-05 | **DeepSeek Web 适配器** | 首个适配器：处理 DeepSeek Web 的页面结构、输入框、发送按钮、回复提取等 | US-01, US-03 |
| R-06 | **消息循环/多轮对话** | 支持持续的对话上下文 —— 在一次对话内连续发送/接收消息 | US-06 |
| R-07 | **Agent 消息注入** | API 接收包含 tool_call/tool_result 的 messages 格式，适配器将这些信息以合适的自然语言形式注入给网页模型 | US-03 |
| R-08 | **错误处理与重试** | 页面加载失败、输入超时、回复卡住等场景的容错处理 | US-06 |
| R-09 | **HTTP 服务** | 使用 Hono 框架搭建轻量 HTTP 服务 | US-02 |
| R-10 | **配置化** | 启动端口、浏览器路径、目标网页 URL、超时等可通过配置文件或环境变量设置 | US-05, US-07 |

#### P1 — 应该有 (Should Have)

| ID | 需求 | 说明 |
|----|------|------|
| R-11 | **会话持久化** | 保存浏览器 cookie/localStorage，重启服务后自动复用已有登录会话 |
| R-12 | **多模型支持架构** | 抽象 `WebAdapter` 接口，支持添加多种网页 AI 适配器（Kimi、智谱清言等） |
| R-13 | **健康检查端点** | `/health` 端点返回服务状态、浏览器状态、当前模型列表 |
| R-14 | **超时控制** | 请求级别的超时（默认 5 分钟），避免资源被长时间占用 |
| R-15 | **速率限制** | 基本的请求排队/限流，避免对网页端过度请求触发风控 |
| R-16 | **浏览器池管理** | 支持预热浏览器实例，请求到来时从池中取用，减少冷启动延迟 |

#### P2 — 可以有 (Nice to Have)

| ID | 需求 | 说明 |
|----|------|------|
| R-17 | **Docker 化** | 提供 Dockerfile，方便容器化部署（含 Playwright 浏览器依赖） |
| R-18 | **多会话隔离** | 每个用户/请求使用独立会话，互不干扰 |
| R-19 | **指标监控** | 请求耗时、token 估算、成功率等 Prometheus 指标暴露 |
| R-20 | **自动重连** | 网页侧登出/断线后自动检测并重连 |
| R-21 | **模型列表 API** | `/v1/models` 端点返回可用模型列表 |
| R-22 | **Token 用量估算** | 基于字符数的粗略 token 估算，返回给调用方 |

### 2.2 架构设计

#### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                    MiMo-Code (opencode)                         │
│                                                                 │
│  ┌─────────────┐    ┌─────────────────────────────────────┐    │
│  │  Agent 系统   │───▶│       Provider 系统                  │    │
│  │  (工具调用)   │    │  ┌───────────────────────────────┐  │    │
│  │  · 文件读写   │    │  │  @ai-sdk/openai-compatible    │  │    │
│  │  · Bash 执行  │    │  │  (标准 API provider)           │  │    │
│  │  · LSP 查询   │    │  └──────────┬────────────────────┘  │    │
│  │  · MCP 工具   │    │             │ HTTP API 调用          │    │
│  └──────┬───────┘    └─────────────┼──────────────────────┘    │
└─────────┼──────────────────────────┼──────────────────────────┘
          │                          │
          │                   (localhost:3456)
          │                          │
          ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Web Wrapper Service                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Hono HTTP Server                                       │    │
│  │  ┌──────────────────┐  ┌──────────────────────────┐     │    │
│  │  │ /v1/chat/        │  │ /health  │ /v1/models    │     │    │
│  │  │ completions      │  │ (健康检查)│ (模型列表)     │     │    │
│  │  │ (OpenAI 兼容)    │  └──────────────────────────┘     │    │
│  │  └────────┬─────────┘                                    │    │
│  └───────────┼─────────────────────────────────────────────┘    │
│              │                                                  │
│  ┌───────────▼─────────────────────────────────────────────┐    │
│  │  Request Processor (请求处理器)                           │    │
│  │  · messages 格式转换 (tool_call/tool_result 处理)        │    │
│  │  · 流式/非流式 逻辑分离                                  │    │
│  │  · 超时控制 / 重试                                       │    │
│  └───────────┬─────────────────────────────────────────────┘    │
│              │                                                  │
│  ┌───────────▼─────────────────────────────────────────────┐    │
│  │  Web Adapter Interface                                    │    │
│  │  ┌──────────────────┐  ┌──────────┐  ┌──────────┐      │    │
│  │  │ DeepSeek Adapter  │  │ Kimi     │  │ Zhipu    │      │    │
│  │  │ (首个实现)         │  │ Adapter  │  │ Adapter  │      │    │
│  │  └────────┬─────────┘  └──────────┘  └──────────┘      │    │
│  └───────────┼─────────────────────────────────────────────┘    │
│              │                                                  │
│  ┌───────────▼─────────────────────────────────────────────┐    │
│  │  Playwright Browser Manager                              │    │
│  │  · 浏览器实例管理 / 上下文管理                            │    │
│  │  · Cookie/Session 持久化                                │    │
│  │  · 页面等待策略 / 容错恢复                               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

#### 消息处理流程

```
OpenAI Request (POST /v1/chat/completions)
│
├─ messages: [
│    { role: "system",   content: "..." },
│    { role: "user",     content: "帮我写一个排序算法" },
│    { role: "assistant", content: "...", tool_calls: [...] },  ← Agent 产生的 tool_call
│    { role: "tool",     content: "{ result: ... }" },          ← Agent 执行的 tool_result
│    { role: "user",     content: "继续" }
│  ]
│
▼
Web Wrapper 处理：
  1. 从 messages 中提取纯文本内容
  2. 将 tool_call + tool_result 对合并为自然语言描述
     "【系统：调用了工具 X，返回结果：...】"
  3. 将合并后的纯文本消息发送给网页模型
  4. 等待网页模型回复
  5. 将回复包装为 OpenAI 格式返回

OpenAI Response:
{
  id: "chatcmpl-xxx",
  object: "chat.completion",
  choices: [{
    index: 0,
    message: {
      role: "assistant",
      content: "网页模型的纯文本回复..."
    },
    finish_reason: "stop"
  }],
  usage: { prompt_tokens: 0, completion_tokens: 0 }  // 暂不提供准确用量
}
```

#### 组件设计草案

```
packages/web-wrapper/
├── src/
│   ├── index.ts                  # 入口：启动 Hono HTTP 服务
│   ├── server.ts                 # Hono 路由定义
│   ├── types.ts                  # 类型定义 (OpenAI 兼容接口)
│   ├── config.ts                 # 配置管理
│   ├── processor/
│   │   ├── request.ts            # 请求处理器：消息转换/格式化
│   │   └── response.ts           # 响应构建：SSE / JSON
│   ├── adapter/
│   │   ├── interface.ts          # WebAdapter 接口定义
│   │   └── deepseek/
│   │       ├── index.ts          # DeepSeek Web 适配器实现
│   │       └── selectors.ts      # CSS 选择器 / XPath 常量
│   └── browser/
│       ├── manager.ts            # Playwright 浏览器实例管理
│       └── session.ts            # Cookie / 会话持久化
├── package.json
├── tsconfig.json
└── README.md
```

### 2.3 WebAdapter 接口设计

```typescript
/**
 * 网页 AI 适配器接口
 * 每种网页 AI 实现该接口，封装页面交互细节
 */
interface WebAdapter {
  /** 适配器唯一标识 */
  readonly id: string
  /** 显示名称 */
  readonly name: string
  /** 目标网页 URL */
  readonly url: string

  /**
   * 向页面发送消息并获取回复
   * @param page     Playwright Page 实例
   * @param messages 合并后的纯文本消息列表
   * @param options  选项（stream 等）
   * @returns        生成响应内容
   */
  sendMessage(
    page: Page,
    messages: { role: string; content: string }[],
    options?: { signal?: AbortSignal; stream?: boolean },
  ): AsyncIterable<string> | Promise<string>
}
```

---

## 3. 待确认问题 (Open Questions)

| # | 问题 | 建议方向 | 需要决策人 |
|---|------|---------|-----------|
| Q-01 | **DeepSeek Web 是否需要登录才能使用？** 如果是，登录流程如何处理？ | 启动时通过浏览器手动登录一次，持久化 cookie；或提供 API 让用户通过浏览器登录 | 开发 + 产品 |
| Q-02 | **对 DeepSeek Web 的使用是否符合其 ToS？** 是否存在账号被封的风险？ | 需要评估风险，建议使用低频策略 + 用户自担风险声明 | 法务 / 产品 |
| Q-03 | **DeepSeek Web 的免费额度是否有每日限制？** | 每个账号有对话数/天限制，需要用户准备多个账号或接受限制 | 产品 |
| Q-04 | **如何处理 tool_call/tool_result 消息的注入格式？** 不同网页模型对"工具结果"的呈现方式是否不同？ | 统一使用自然语言描述当前步骤，"用户说... → AI 回复... → 工具执行结果..." | 开发 |
| Q-05 | **流式模式下，如何从 DeepSeek Web 页面提取增量输出？** | 轮询页面 DOM 变化或监听页面事件，将增量文本推送给 SSE | 开发 |
| Q-06 | **浏览器管理策略：每个请求一个新页面 vs 复用同一页面？** | 建议每个对话 session 对应一个独立页面，避免上下文混淆 | 开发 |
| Q-07 | **是否需要在 MiMo-Code 侧注册为内置 provider？** | 建议作为自定义 provider，用户在 mimocode.json 中配置 web-wrapper 的 baseURL | 架构 |
| Q-08 | **Playwright 浏览器的安装和依赖如何处理？** | Docker 内预装 Chromium，或通过 npx playwright install 引导用户安装 | 开发 |
| Q-09 | **Web Wrapper 服务是独立进程还是 MiMo-Code 子进程？** | 建议作为独立服务运行，MiMo-Code 通过 HTTP 调用（类似其他 API provider） | 架构 |
| Q-10 | **是否需要 API key 认证保护 Web Wrapper 接口？** | 建议加简单的 token 认证，防止未经授权的使用 | 产品 |
| Q-11 | **网页模型不支持 system message 如何处理？** | 将 system 消息作为第一条 user 消息发送，或者拼接在 prompt 前缀中 | 开发 |

---

## 4. MiMo-Code 集成方案

### Provider 注册方式

用户只需在 `mimocode.json` 中配置：

```json
{
  "provider": {
    "web-wrapper": {
      "name": "Web Wrapper",
      "options": {
        "baseURL": "http://localhost:3456/v1"
      },
      "models": {
        "deepseek-web": {
          "id": "deepseek-web",
          "name": "DeepSeek Web (Free)",
          "reasoning": true,
          "tool_call": false,
          "limit": {
            "context": 32000,
            "output": 4096
          },
          "cost": {
            "input": 0,
            "output": 0
          }
        }
      }
    }
  }
}
```

### Agent 消息循环

```
Agent 系统                              Web Wrapper               Web Page
   │                                       │                        │
   │  1. POST /v1/chat/completions          │                        │
   │     { messages: [...] }               │                        │
   │──────────────────────────────────────▶│                        │
   │                                       │  2. 转换消息格式        │
   │                                       │  3. 发送到页面          │
   │                                       │──────────────────────▶│
   │                                       │                        │
   │                                       │  4. 页面生成回复        │
   │                                       │◀──────────────────────│
   │  5. 返回回复内容                       │                        │
   │◀──────────────────────────────────────│                        │
   │                                       │                        │
   │  6. Agent 解析回复中的 tool_call       │                        │
   │  7. Agent 执行工具（bash/文件等）       │                        │
   │  8. 再次 POST /v1/chat/completions     │                        │
   │     追加 tool_result 消息              │                        │
   │──────────────────────────────────────▶│                        │
   │                                       │  9. 注入工具结果        │
   │                                       │  10. 发送到页面         │
   │                                       │──────────────────────▶│
   │                                       │                        │
   │  12. 返回回复内容                      │  11. 页面继续推理       │
   │◀──────────────────────────────────────│◀──────────────────────│
   │                                       │                        │
```

---

## 5. 交付标准 (Definition of Done)

| 标准 | 说明 |
|------|------|
| ✅ 端点可用 | `curl -X POST http://localhost:3456/v1/chat/completions -d '{"model":"deepseek-web","messages":[{"role":"user","content":"你好"}]}'` 返回有效回复 |
| ✅ 流式可用 | SSE 流正常推送，客户端可逐块接收内容 |
| ✅ 多轮对话 | 连续 5 轮以上对话无上下文丢失 |
| ✅ 错误处理 | 网络中断、页面卡住、超时等场景优雅降级，不泄漏敏感信息 |
| ✅ Provider 集成 | MiMo-Code 配置 web-wrapper provider 后可正常在模型选择中看到并选用 |
