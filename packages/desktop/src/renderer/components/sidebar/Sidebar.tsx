// Sidebar.tsx - 侧边栏导航组件

import { PanelType } from "../layout/AppLayout"

interface SidebarProps {
  activePanel: PanelType
  onPanelChange: (panel: PanelType) => void
  onToggleCollapse: () => void
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside class="sidebar">
      {/* Logo */}
      <div class="sidebar-logo">
        <span class="logo-icon">🐼</span>
        <span class="logo-text">MiMo Desktop</span>
      </div>

      {/* 导航菜单 */}
      <nav class="sidebar-nav">
        <button
          class="nav-item"
          classList={{ active: props.activePanel === "chat" }}
          onClick={() => props.onPanelChange("chat")}
          title="对话 (Ctrl+1)"
        >
          <span class="nav-icon">💬</span>
          <span class="nav-label">对话</span>
        </button>

        <button
          class="nav-item"
          classList={{ active: props.activePanel === "agent" }}
          onClick={() => props.onPanelChange("agent")}
          title="Agent (Ctrl+2)"
        >
          <span class="nav-icon">🤖</span>
          <span class="nav-label">Agent</span>
        </button>

        <button
          class="nav-item"
          classList={{ active: props.activePanel === "memory" }}
          onClick={() => props.onPanelChange("memory")}
          title="记忆 (Ctrl+3)"
        >
          <span class="nav-icon">📝</span>
          <span class="nav-label">记忆</span>
        </button>

        <button
          class="nav-item"
          classList={{ active: props.activePanel === "settings" }}
          onClick={() => props.onPanelChange("settings")}
          title="设置 (Ctrl+4)"
        >
          <span class="nav-icon">⚙️</span>
          <span class="nav-label">设置</span>
        </button>
      </nav>

      {/* 底部按钮 */}
      <div class="sidebar-footer">
        <button class="collapse-btn" onClick={props.onToggleCollapse}>
          « 收起
        </button>
      </div>
    </aside>
  )
}
