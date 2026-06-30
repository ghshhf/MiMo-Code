import type { ChatMessage } from "./types"

/**
 * 将 OpenAI 格式的消息转为纯文本消息列表（网页模型能理解的格式）。
 *
 * 转换规则：
 * 1. system message → 转为 user message 并前缀 [系统指令]
 * 2. assistant + tool_calls → 保留 assistant 文本，将 tool_call 追加为自然语言
 * 3. tool + tool_call_id → 转为 user message 并前缀 [工具结果: <name>]
 * 4. 普通 user/assistant 消息保留
 */
export function convertMessages(messages: ChatMessage[]): string {
  const parts: string[] = []

  for (const msg of messages) {
    switch (msg.role) {
      case "system":
        parts.push(`[系统指令] ${msg.content}`)
        break

      case "user":
        if (msg.content) parts.push(msg.content)
        break

      case "assistant":
        if (msg.content) parts.push(msg.content)
        if (msg.tool_calls) {
          for (const tc of msg.tool_calls) {
            parts.push(`[工具调用: ${tc.function.name}]\n\`\`\`json\n${tc.function.arguments}\n\`\`\``)
          }
        }
        break

      case "tool":
        parts.push(`[工具结果]\n${typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)}`)
        break
    }
  }

  return parts.join("\n\n")
}
