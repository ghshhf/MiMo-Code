// AppLayout.tsx - 新的应用布局组件
// 使用全局状态管理（AppStore）替代本地状态

import { Show } from "solid-js"
import { Sidebar } from "../sidebar/Sidebar"
import { ChatPanel } from "../chat/ChatPanel"
import { AgentPanel } from "../agent/AgentPanel"
import { MemoryPanel } from "../memory/MemoryPanel"
import { SettingsPanel } from "../settings/SettingsPanel"
import { ProjectPanel } from "../project/ProjectPanel"
import { useAppStore } from "../../stores/AppStore"

import "./AppLayout-styles.css"
import "../memory/memory-styles.css"
import "../agent/agent-styles.css"
import "../settings/settings-styles.css"
import "../project/project-styles.css"

export type PanelType = "chat" | "agent" | "memory" | "settings" | "project"

export function AppLayout() {
  const store = useAppStore()

  return (
    <div class="app-layout">
      {/* 侧边栏 */}
      <Sidebar
        activePanel={store.activePanel() as PanelType}
        sidebarCollapsed={store.sidebarCollapsed()}
        onPanelChange={(panel: PanelType) => store.setActivePanel(panel)}
        onToggleCollapse={() => store.toggleSidebar()}
      />

      {/* 主内容区 */}
      <main class="main-content">
        <Show when={store.activePanel() === "chat"}>
          <ChatPanel />
        </Show>

        <Show when={store.activePanel() === "agent"}>
          <AgentPanel />
        </Show>

        <Show when={store.activePanel() === "project"}>
          <ProjectPanel />
        </Show>

        <Show when={store.activePanel() === "memory"}>
          <MemoryPanel />
        </Show>

        <Show when={store.activePanel() === "settings"}>
          <SettingsPanel />
        </Show>
      </main>

      {/* 状态栏 */}
      <footer class="status-bar">
        <div class="status-left">
          <span class="status-indicator" classList={{
            connected: store.sidecar()?.connected,
            disconnected: !store.sidecar()?.connected,
          }}>
            {store.sidecar()?.connected ? "● 侧车已连接" : "○ 侧车未连接"}
          </span>
        </div>
        <div class="status-right">
          <span class="status-item">面板: {store.activePanel()}</span>
          <span class="status-item">主题: {store.settings.theme}</span>
          <span class="status-item">v0.1.4</span>
        </div>
      </footer>
    </div>
  )
}
