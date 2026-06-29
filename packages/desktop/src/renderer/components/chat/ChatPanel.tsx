// ChatPanel.tsx - 对话界面组件（占位）

export function ChatPanel() {
  return (
    <div class="chat-panel">
      <div class="chat-header">
        <h2>💬 智能对话</h2>
        <div class="chat-actions">
          <button class="action-btn" title="新建对话">➕</button>
          <button class="action-btn" title="清空历史">🗑️</button>
        </div>
      </div>

      <div class="chat-messages">
        <div class="message assistant">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <p>你好！我是 MiMo AI 助手。有什么可以帮你的吗？</p>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <textarea
          class="input-area"
          placeholder="输入消息... (Shift+Enter 换行)"
          rows={3}
        />
        <button class="send-btn">发送 ➤</button>
      </div>
    </div>
  )
}
