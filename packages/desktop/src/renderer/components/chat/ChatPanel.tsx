// ChatPanel.tsx - 接入 API 的对话界面组件

import { createSignal, For, Show, createEffect } from "solid-js"
import { useAppStore, type ChatMessage } from "../../stores/AppStore"
import { sendChatMessage } from "../../stores/api"

export function ChatPanel() {
  const store = useAppStore()
  const [input, setInput] = createSignal("")
  const [isLoading, setIsLoading] = createSignal(false)
  const [streamingContent, setStreamingContent] = createSignal("")

  // 发送消息
  const sendMessage = async () => {
    const content = input().trim()
    if (!content || isLoading()) return

    // 添加用户消息
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }
    store.addMessage(userMsg)
    setInput("")
    setIsLoading(true)
    setStreamingContent("")

    // 调用 API（优先侧车，降级到模拟）
    const reply = await sendChatMessage(content, (chunk) => {
      setStreamingContent(prev => prev + chunk)
    })

    // 添加 AI 回复
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: reply,
      timestamp: new Date(),
    }
    store.addMessage(aiMsg)
    setStreamingContent("")
    setIsLoading(false)
  }

  // 键盘事件
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div class="chat-panel">
      {/* 顶部工具栏 */}
      <div class="chat-header">
        <div class="header-left">
          <span class="session-count">{store.sessions().length} 个会话</span>
        </div>
        <div class="header-center">
          <span class="session-title">
            💬 {store.currentSession()?.title || "智能对话"}
          </span>
        </div>
        <div class="header-right">
          <button class="icon-btn" onClick={() => store.newSession()} title="新建对话">
            ➕ 新建
          </button>
          <button class="icon-btn" onClick={() => store.clearMessages()} title="清空消息">
            🗑️ 清空
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div class="chat-messages" id="message-list">
        <For each={store.currentSession()?.messages || []}>
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
                <Show when={message.role === "assistant"}>
                  <div class="message-actions">
                    <button class="action-btn-sm" title="复制"
                      onClick={() => navigator.clipboard.writeText(message.content)}>
                      📋 复制
                    </button>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>

        {/* 流式输出 */}
        <Show when={streamingContent()}>
          <div class="message assistant">
            <div class="message-avatar">🤖</div>
            <div class="message-wrapper">
              <div class="message-meta">
                <span class="message-role">MiMo AI</span>
                <span class="message-time">正在输入...</span>
              </div>
              <div class="message-content">
                <pre>{streamingContent()}</pre>
              </div>
            </div>
          </div>
        </Show>

        {/* 等待指示器 */}
        <Show when={isLoading() && !streamingContent()}>
          <div class="message assistant">
            <div class="message-avatar">🤖</div>
            <div class="message-wrapper">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </Show>
      </div>

      {/* 输入区域 */}
      <div class="chat-input-area">
        <div class="input-toolbar">
          <button class="toolbar-btn" title="上传文件" disabled={isLoading()}>📎</button>
          <button class="toolbar-btn" title="语音输入" disabled={isLoading()}>🎤</button>
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
          <span class="input-hint">
            Enter 发送 • Shift+Enter 换行
            {store.sidecar()?.connected ? " • 侧车已连接" : " • 离线模式"}
          </span>
        </div>
      </div>
    </div>
  )
}
