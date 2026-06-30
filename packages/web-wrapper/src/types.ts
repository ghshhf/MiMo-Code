/**
 * OpenAI 兼容的请求/响应类型定义
 * 用于通过 Web Wrapper 与免费 AI 网页交互
 */

/** OpenAI 兼容的聊天补全请求 */
export interface ChatRequest {
  model: string
  messages: ChatMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
  /** 会话 ID，用于复用浏览器页面 */
  session_id?: string
}

/** 聊天消息 */
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string | null
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

/** 工具调用 */
export interface ToolCall {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string
  }
}

/** OpenAI 兼容的聊天补全响应（非流式） */
export interface ChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: ChatChoice[]
  usage?: TokenUsage
}

/** 响应选择 */
export interface ChatChoice {
  index: number
  message: ResponseMessage
  finish_reason: string | null
}

/** 响应消息 */
export interface ResponseMessage {
  role: string
  content: string | null
  /** 推理/思考内容（DeepSeek 特有） */
  reasoning_content?: string
}

/** Token 用量 */
export interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
}

/** SSE 流式事件（Delta） */
export interface SSEDelta {
  id: string
  object: string
  created: number
  model: string
  choices: DeltaChoice[]
}

/** Delta 选择 */
export interface DeltaChoice {
  index: number
  delta: Delta
  finish_reason: string | null
}

/** Delta 内容 */
export interface Delta {
  content?: string
  /** 推理/思考内容 delta（DeepSeek 特有） */
  reasoning_content?: string
}

/** 页面元素选择器 */
export interface PageSelectors {
  /** 输入框选择器 */
  textarea: string
  /** 提交按钮选择器 */
  submitButton: string
  /** 回复区域选择器 */
  responseArea: string
  /** 思考区域选择器（可选） */
  thinkingArea?: string
  /** 停止按钮选择器（可选） */
  stopButton?: string
}

/** 发送消息选项 */
export interface SendMessageOptions {
  stream: boolean
  timeout?: number
}

/** Web Wrapper 自定义错误 */
export class WebWrapperError extends Error {
  readonly type: string
  readonly code: string

  constructor(type: string, message: string, code: string) {
    super(message)
    this.name = "WebWrapperError"
    this.type = type
    this.code = code
  }
}

/** 健康检查响应 */
export interface HealthResponse {
  status: string
  browserConnected: boolean
  activeSessions: number
  adapters: string[]
}
