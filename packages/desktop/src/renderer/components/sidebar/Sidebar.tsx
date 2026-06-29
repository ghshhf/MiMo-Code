// Sidebar.tsx - 侧边栏导航组件（由 AppLayout 传递 props）

import type { PanelType } from "../layout/AppLayout"

interface SidebarProps {
  activePanel: PanelType
  sidebarCollapsed: boolean
  onPanelChange: (panel: PanelType) => void
  onToggleCollapse: () => void
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside class="sidebar" classList={{ collapsed: props.sidebarCollapsed }}>
      {/* Logo */}
      <div class="sidebar-logo">
        <span class="logo-icon">🐼</span>
        <span class="logo-text" classList={{ hidden: props.sidebarCollapsed }}>MiMo Desktop</span>
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
          <span class="nav-label" classList={{ hidden: props.sidebarCollapsed }}>对话</span>
        </button>

        <button
          class="nav-item"
          classList={{ active: props.activePanel === "agent" }}
          onClick={() => props.onPanelChange("agent")}
          title="Agent (Ctrl+2)"
        >
          <span class="nav-icon">🤖</span>
          <span class="nav-label" classList={{ hidden: props.sidebarCollapsed }}>Agent</span>
        </button>

        <button
          class="nav-item"
          classList={{ active: props.activePanel === "project" }}
          onClick={() => props.onPanelChange("project")}
          title="项目 (Ctrl+3)"
        >
          <span class="nav-icon">📂</span>
          <span class="nav-label" classList={{ hidden: props.sidebarCollapsed }}>项目</span>
        </button>

        <button
          class="nav-item"
          classList={{ active: props.activePanel === "memory" }}
          onClick={() => props.onPanelChange("memory")}
          title="记忆 (Ctrl+4)"
        >
          <span class="nav-icon">📝</span>
          <span class="nav-label" classList={{ hidden: props.sidebarCollapsed }}>记忆</span>
        </button>

        <button
          class="nav-item"
          classList={{ active: props.activePanel === "settings" }}
          onClick={() => props.onPanelChange("settings")}
          title="设置 (Ctrl+5)"
        >
          <span class="nav-icon">⚙️</span>
          <span class="nav-label" classList={{ hidden: props.sidebarCollapsed }}>设置</span>
        </button>
      </nav>

      {/* 底部折叠按钮 */}
      <div class="sidebar-footer">
        <button class="nav-item collapse-btn" onClick={props.onToggleCollapse} title="折叠侧边栏">
          <span class="nav-icon">{props.sidebarCollapsed ? "▶" : "◀"}</span>
          <span class="nav-label" classList={{ hidden: props.sidebarCollapsed }}>折叠</span>
        </button>
      </div>
    </aside>
  )
}
