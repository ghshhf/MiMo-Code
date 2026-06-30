/**
 * Hono HTTP 服务
 * 提供 OpenAI 兼容的 /v1/chat/completions API
 */
import { Hono } from "hono"
import { cors } from "hono/cors"
import { streamSSE } from "hono/streaming"
import type { AppConfig } from "./config"
import type { BrowserManager } from "./browser"
import type { WebAdapter } from "./adapter"
import { convertMessages } from "./message"
import type { ChatRequest, ChatResponse, SSEDelta } from "./types"
import { z } from "zod"

/** 请求校验 schema */
const chatRequestSchema = z.object({
  model: z.string(),
  messages: z.array(z.any()),
  stream: z.boolean().optional().default(false),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  session_id: z.string().optional(),
})

export interface ServerDeps {
  config: AppConfig
  browser: BrowserManager
  adapter: WebAdapter
}

/**
 * 启动 Hono HTTP 服务
 */
export function serve(deps: ServerDeps): void {
  const app = new Hono()

  // CORS 中间件
  app.use("*", cors({ origin: deps.config.allowedOrigins }))

  // 健康检查端点
  app.get("/health", (c) => {
    const health = deps.browser.getHealth()
    return c.json({
      status: "ok",
      browserConnected: health.browserConnected,
      activeSessions: health.activeSessions,
      adapters: [deps.adapter.id],
    })
  })

  // OpenAI 兼容的聊天补全端点
  app.post("/v1/chat/completions", async (c) => {
    const raw = await c.req.json()
    const parsed = chatRequestSchema.parse(raw)

    // 获取 session 对应的浏览器页面
    const sessionId = parsed.session_id || "default"
    const page = await deps.browser.getSession(sessionId, deps.adapter)

    // 转换消息格式：tool_call/tool_result → 自然语言
    const text = convertMessages(parsed.messages)

    if (parsed.stream) {
      return streamSSE(c, async (stream) => {
        const id = `chat-${Date.now()}`

        for await (const chunk of deps.adapter.sendMessage(page, text, { stream: true })) {
          const data = JSON.parse(chunk)

          if (data.type === "reasoning") {
            const event: SSEDelta = {
              id,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: parsed.model,
              choices: [
                {
                  index: 0,
                  delta: { reasoning_content: data.content },
                  finish_reason: null,
                },
              ],
            }
            await stream.writeSSE({ data: JSON.stringify(event) })
          } else if (data.type === "content") {
            const event: SSEDelta = {
              id,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: parsed.model,
              choices: [
                {
                  index: 0,
                  delta: { content: data.content },
                  finish_reason: null,
                },
              ],
            }
            await stream.writeSSE({ data: JSON.stringify(event) })
          }
        }

        // 流结束信号
        await stream.writeSSE({ data: "[DONE]" })
      })
    }

    // 非流式模式：等待完整回复
    let fullContent = ""
    let fullReasoning = ""

    for await (const chunk of deps.adapter.sendMessage(page, text, { stream: false })) {
      const data = JSON.parse(chunk)
      if (data.type === "complete") {
        fullContent = data.content || ""
        fullReasoning = data.reasoning || ""
      }
    }

    const response: ChatResponse = {
      id: `chat-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: parsed.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: fullContent,
            ...(fullReasoning ? { reasoning_content: fullReasoning } : {}),
          },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 0, completion_tokens: 0 },
    }

    return c.json(response)
  })

  // 全局错误处理
  app.onError((err, c) => {
    console.error(`[web-wrapper] ERROR ${err.message}`)
    return c.json(
      {
        error: {
          type: "server_error",
          message: err.message,
          code: "ERR_INTERNAL",
        },
      },
      500,
    )
  })

  // 使用 Bun 的 serve 启动 HTTP 服务器
  Bun.serve({
    fetch: app.fetch,
    port: deps.config.port,
  })

  console.log(`[web-wrapper] INFO  Listening on :${deps.config.port}`)
}
