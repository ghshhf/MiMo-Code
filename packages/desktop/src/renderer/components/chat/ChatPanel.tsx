// ChatPanel.tsx - 功能完整的对话界面组件

import { createSignal, For, Show, onMount, onCleanup } from "solid-js"

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export function ChatPanel() {
  const [messages, setMessages] = createSignal<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "你好！我是 MiMo AI 助手。有什么可以帮你的吗？\n\n我可以帮你：\n- 📝 编写和解释代码\n- 🔍 分析项目结构\n- 🐛 调试问题\n- 📚 生成文档",
      timestamp: new Date(),
    }
  ])
  
  const [input, setInput] = createSignal("")
  const [isLoading, setIsLoading] = createSignal(false)
  const [sessions, setSessions] = createSignal<{id: string, title: string}[]>([
    { id: "1", title: "新对话" }
  ])
  const [currentSession, setCurrentSession] = createSignal("1")

  // 发送消息
  const sendMessage = async () => {
    const content = input().trim()
    if (!content || isLoading()) return

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }
    setMessages([...messages(), userMessage])
    setInput("")
    setIsLoading(true)

    // 模拟 AI 回复（后续接入真实 API）
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `收到你的消息："${content}"\n\n这是模拟回复。后续会接入真实的 MiMo API。`,
        timestamp: new Date(),
      }
      setMessages([...messages(), aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 清空对话
  const clearMessages = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "对话已清空。有什么可以帮你的吗？",
        timestamp: new Date(),
      }
    ])
  }

  // 新建对话
  const newSession = () => {
    const newId = Date.now().toString()
    setSessions([...sessions(), { id: newId, title: "新对话" }])
    setCurrentSession(newId)
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "开始新对话。有什么可以帮你的吗？",
        timestamp: new Date(),
      }
    ])
  }

  return (
    <div class="chat-panel">
      {/* 顶部工具栏 */}
      <div class="chat-header">
        <div class="header-left">
          <button class="icon-btn" onClick={newSession} title="新建对话">
            ➕ 新对话
          </button>
        </div>
        <div class="header-center">
          <span class="session-title">💬 智能对话</span>
        </div>
        <div class="header-right">
          <button class="icon-btn" onClick={clearMessages} title="清空对话">
            🗑️ 清空
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div class="chat-messages" id="message-list">
        <For each={messages()}>
          {(message) => (
            <div class="message" classList={{ user: message.role === "user", assistant: message.role === "assistant" }}>
              <div class="message-avatar">
                {message.role === "user" ? "👤" : "🤖"}
              </div>
              <div class="message-wrapper">
                <div class="message-meta">
                  <span class="message-role">
                    {message.role === "user" ? "你" : "MiMo AI"}
                  </span>
                  <span class="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div class="message-content">
                  <pre>{message.content}</pre>
                </div>
                <Show when={message.role === "assistant" && !message.isStreaming}>
                  <div class="message-actions">
                    <button class="action-btn-sm" title="复制">📋 复制</button>
                    <button class="action-btn-sm" title="应用代码">✅ 应用</button>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>

        {/* 加载指示器 */}
        <Show when={isLoading()}>
          <div class="message assistant">
            <div class="message-avatar">🤖</div>
            <div class="message-wrapper">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </Show>
      </div>

      {/* 输入区域 */}
      <div class="chat-input-area">
        <div class="input-toolbar">
          <button class="toolbar-btn" title="上传文件">📎</button>
          <button class="toolbar-btn" title="语音输入">🎤</button>
        </div>
        <div class="input-wrapper">
          <textarea
            class="input-area"
            value={input()}
            onInput={(e) => setInput(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
            rows={3}
          />
          <button
            class="send-btn"
            onClick={sendMessage}
            disabled={!input().trim() || isLoading()}
          >
            {isLoading() ? "⏳" : "➤ 发送"}
          </button>
        </div>
        <div class="input-footer">
          <span class="input-hint">Enter 发送 • Shift+Enter 换行 • Ctrl+/ 命令</span>
        </div>
      </div>
    </div>
  )
}
