// AppStore.tsx - 全局状态管理
// 使用 SolidJS Context API 实现跨面板状态共享

import { createContext, createSignal, createResource, useContext, onMount, type JSX, type Resource } from "solid-js"

// ============ 类型定义 ============

export type ThemeMode = "light" | "dark" | "auto"
export type Language = "zh-CN" | "en-US" | "ja-JP"

export interface AppSettings {
  theme: ThemeMode
  language: Language
  fontSize: number
  autoSave: boolean
  defaultModel: string
  temperature: number
  maxTokens: number
  streamOutput: boolean
  showLineNumbers: boolean
  wordWrap: boolean
}

export interface ProjectInfo {
  name: string
  path: string
  language: string
  fileCount: number
  lastOpened: Date
}

export interface SidecarStatus {
  connected: boolean
  url: string
  version: string
  uptime: number
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  isStreaming?: boolean
}

// ============ Store 结构 ============

export interface AppStore {
  // 设置
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
  resetSettings: () => void

  // 侧车连接
  sidecar: Resource<SidecarStatus>
  connectSidecar: () => Promise<void>

  // 会话
  sessions: () => ChatSession[]
  currentSession: () => ChatSession | undefined
  switchSession: (id: string) => void
  newSession: () => void
  addMessage: (msg: ChatMessage) => void
  clearMessages: () => void

  // 项目
  project: () => ProjectInfo | null
  setProject: (info: ProjectInfo | null) => void

  // UI 状态
  sidebarCollapsed: () => boolean
  toggleSidebar: () => void
  activePanel: () => string
  setActivePanel: (panel: string) => void
}

// ============ 默认设置 ============

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  language: "zh-CN",
  fontSize: 14,
  autoSave: true,
  defaultModel: "gpt-4",
  temperature: 0.7,
  maxTokens: 4096,
  streamOutput: true,
  showLineNumbers: true,
  wordWrap: true,
}

// ============ Context 创建 ============

const AppStoreContext = createContext<AppStore>()

// ============ Provider 组件 ============

export function AppStoreProvider(props: { children: JSX.Element }) {
  // 设置
  const [settings, setSettings] = createSignal<AppSettings>(DEFAULT_SETTINGS)

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }))
    // 持久化到 localStorage
    try {
      localStorage.setItem("app-settings", JSON.stringify({ ...settings(), ...partial }))
    } catch {}
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    try {
      localStorage.removeItem("app-settings")
    } catch {}
  }

  // 从 localStorage 恢复设置
  onMount(() => {
    try {
      const saved = localStorage.getItem("app-settings")
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings(prev => ({ ...prev, ...parsed }))
      }
    } catch {}
  })

  // 侧车连接
  const [sidecar] = createResource<SidecarStatus>(async () => {
    const url = "http://localhost:5173"
    try {
      // 尝试连接侧车
      const resp = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) })
      if (resp.ok) {
        return { connected: true, url, version: "dev", uptime: 0 }
      }
    } catch {}
    return { connected: false, url, version: "-", uptime: 0 }
  })

  const connectSidecar = async () => {
    sidecar.refetch()
  }

  // 会话管理
  const [sessions, setSessions] = createSignal<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = createSignal<string>("")

  const currentSession = () => sessions().find(s => s.id === currentSessionId())

  const switchSession = (id: string) => {
    setCurrentSessionId(id)
  }

  const newSession = () => {
    const session: ChatSession = {
      id: Date.now().toString(),
      title: `对话 ${sessions().length + 1}`,
      messages: [],
      createdAt: new Date(),
    }
    setSessions([...sessions(), session])
    setCurrentSessionId(session.id)
  }

  const addMessage = (msg: ChatMessage) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== currentSessionId()) return s
      return { ...s, messages: [...s.messages, msg] }
    }))
  }

  const clearMessages = () => {
    setSessions(prev => prev.map(s => {
      if (s.id !== currentSessionId()) return s
      return { ...s, messages: [] }
    }))
  }

  // 项目
  const [project, setProject] = createSignal<ProjectInfo | null>(null)

  // UI 状态
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false)
  const [activePanel, setActivePanel] = createSignal("chat")

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed())

  // 初始化一个默认会话
  onMount(() => {
    newSession()
  })

  // ============ Store 值 ============

  const store: AppStore = {
    settings, updateSettings, resetSettings,
    sidecar, connectSidecar,
    sessions, currentSession, switchSession, newSession, addMessage, clearMessages,
    project, setProject,
    sidebarCollapsed, toggleSidebar, activePanel, setActivePanel,
  }

  return (
    <AppStoreContext.Provider value={store}>
      {props.children}
    </AppStoreContext.Provider>
  )
}

// ============ Hook ============

export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext)
  if (!ctx) {
    throw new Error("useAppStore must be used within an AppStoreProvider")
  }
  return ctx
}
