// AppLayout.tsx - 新的应用布局组件
// 这是桌面版重构的第一步：创建现代化的布局系统

import { Show, createSignal, onCleanup } from "solid-js"
import { Sidebar } from "../sidebar/Sidebar"
import { ChatPanel } from "../chat/ChatPanel"
import { AgentPanel } from "../agent/AgentPanel"
import { MemoryPanel } from "../memory/MemoryPanel"
import { SettingsPanel } from "../settings/SettingsPanel"
import { ProjectPanel } from "../project/ProjectPanel"

import "./AppLayout-styles.css"
import "../memory/memory-styles.css"
import "../agent/agent-styles.css"
import "../settings/settings-styles.css"
import "../project/project-styles.css"

export type PanelType = "chat" | "agent" | "memory" | "settings" | "project"

export function AppLayout() {
  const [activePanel, setActivePanel] = createSignal<PanelType>("chat")
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false)

  // 键盘快捷键
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault()
          setSidebarCollapsed(!sidebarCollapsed())
          break
        case "1":
          e.preventDefault()
          setActivePanel("chat")
          break
        case "2":
          e.preventDefault()
          setActivePanel("agent")
          break
        case "3":
          e.preventDefault()
          setActivePanel("project")
          break
        case "4":
          e.preventDefault()
          setActivePanel("memory")
          break
        case "5":
          e.preventDefault()
          setActivePanel("settings")
          break
      }
    }
  }

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown)
  })

  return (
    <div class="app-layout" onKeyDown={handleKeyDown}>
      {/* 侧边栏 */}
      <Show when={!sidebarCollapsed()}>
        <Sidebar
          activePanel={activePanel()}
          onPanelChange={setActivePanel}
          onToggleCollapse={() => setSidebarCollapsed(true)}
        />
      </Show>

      {/* 主内容区 */}
      <main class="main-content">
        <Show when={activePanel() === "chat"}>
          <ChatPanel />
        </Show>
        
        <Show when={activePanel() === "agent"}>
          <AgentPanel />
        </Show>
        
        <Show when={activePanel() === "project"}>
          <ProjectPanel />
        </Show>
        
        <Show when={activePanel() === "memory"}>
          <MemoryPanel />
        </Show>
        
        <Show when={activePanel() === "settings"}>
          <SettingsPanel />
        </Show>
      </main>

      {/* 状态栏 */}
      <footer class="status-bar">
        <span class="status-item">✅ 就绪</span>
        <span class="status-item">📂 {activePanel()}</span>
        <button
          class="collapse-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed())}
        >
          {sidebarCollapsed() ? "»" : "«"}
        </button>
      </footer>
    </div>
  )
}
