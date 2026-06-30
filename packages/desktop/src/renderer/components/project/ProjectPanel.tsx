// ProjectPanel.tsx - 接入 API 的项目面板

import { createSignal, For, Show, onMount } from "solid-js"
import { fetchProjectFiles } from "../../stores/api"
import "./project-styles.css"

interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  size?: number
  modifiedAt?: string
}

// 文件图标映射
const extensionIcon: Record<string, string> = {
  ".ts": "🔷", ".tsx": "⚛️", ".js": "🟨", ".jsx": "⚛️",
  ".json": "📋", ".md": "📝", ".css": "🎨", ".html": "🌐",
  ".py": "🐍", ".rs": "🦀", ".go": "🔵", ".java": "☕",
  ".yaml": "⚙️", ".yml": "⚙️", ".toml": "⚙️", ".env": "🔒",
  ".gitignore": "🙈", ".svg": "🖼️", ".png": "🖼️", ".jpg": "🖼️",
}

function getFileIcon(name: string, type: "file" | "directory"): string {
  if (type === "directory") {
    if (name === "node_modules") return "📦"
    if (name === "src") return "📁"
    if (name === "dist" || name === "out") return "📦"
    return "📂"
  }
  const ext = "." + name.split(".").pop()
  return extensionIcon[ext] || "📄"
}

function formatSize(bytes?: number): string {
  if (!bytes) return "-"
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function ProjectPanel() {
  const [files, setFiles] = createSignal<FileNode[]>([])
  const [expandedDirs, setExpandedDirs] = createSignal<Set<string>>(new Set(["src"]))
  const [searchQuery, setSearchQuery] = createSignal("")
  const [isLoading, setIsLoading] = createSignal(true)

  onMount(async () => {
    setIsLoading(true)
    const data = await fetchProjectFiles(".")
    setFiles(data)
    setIsLoading(false)
  })

  const toggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  return (
    <div class="project-panel">
      <div class="project-header">
        <h2>📂 项目浏览</h2>
        <div class="project-info">
          <span>{files.length} 个根目录项</span>
        </div>
      </div>

      <div class="project-search">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="搜索文件..." value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)} class="search-input" />
      </div>

      <div class="file-tree">
        <Show when={isLoading()}>
          <div class="empty-state"><div class="spinner" /><p>加载项目文件...</p></div>
        </Show>

        <Show when={!isLoading() && files().length === 0}>
          <div class="empty-state">
            <div class="empty-icon">📂</div>
            <p>未打开项目</p>
            <button class="btn-secondary" onClick={() => fetchProjectFiles(".").then(setFiles)}>
              刷新文件列表
            </button>
          </div>
        </Show>

        <For each={files()}>
          {(node) => (
            <FileTreeNode node={node} depth={0}
              expandedDirs={expandedDirs()}
              searchQuery={searchQuery()}
              onToggle={toggleDir} />
          )}
        </For>
      </div>
    </div>
  )
}

// 文件树节点组件
function FileTreeNode(props: {
  node: FileNode
  depth: number
  expandedDirs: Set<string>
  searchQuery: string
  onToggle: (path: string) => void
}) {
  const { node, depth, expandedDirs, searchQuery, onToggle } = props
  const isExpanded = expandedDirs.has(node.path)
  const matchesSearch = !searchQuery || node.name.toLowerCase().includes(searchQuery.toLowerCase())

  // 模拟子节点（组件内扩展）
  const children = (() => {
    if (node.type !== "directory" || !isExpanded) return []
    if (node.name === "src") return [
      { name: "main", path: "/src/main", type: "directory" as const },
      { name: "renderer", path: "/src/renderer", type: "directory" as const },
    ]
    if (node.path === "/src/main") return [
      { name: "index.ts", path: "/src/main/index.ts", type: "file" as const, size: 3200, modifiedAt: "2024-06-28" },
      { name: "windows.ts", path: "/src/main/windows.ts", type: "file" as const, size: 5500, modifiedAt: "2024-06-27" },
    ]
    if (node.path === "/src/renderer") return [
      { name: "index.tsx", path: "/src/renderer/index.tsx", type: "file" as const, size: 2800, modifiedAt: "2024-06-29" },
      { name: "components", path: "/src/renderer/components", type: "directory" as const },
      { name: "stores", path: "/src/renderer/stores", type: "directory" as const },
    ]
    if (node.path === "/src/renderer/components") return [
      { name: "layout", path: "/src/renderer/components/layout", type: "directory" as const },
      { name: "chat", path: "/src/renderer/components/chat", type: "directory" as const },
      { name: "agent", path: "/src/renderer/components/agent", type: "directory" as const },
      { name: "memory", path: "/src/renderer/components/memory", type: "directory" as const },
    ]
    return []
  })()

  if (!matchesSearch && children().length === 0) return null

  return (
    <>
      <div class="file-node" style={{ "padding-left": `${depth * 16 + 8}px` }}
        onClick={() => node.type === "directory" && onToggle(node.path)}>
        <span class="file-expand">
          {node.type === "directory" ? (isExpanded ? "▼" : "▶") : " "}
        </span>
        <span class="file-icon">{getFileIcon(node.name, node.type)}</span>
        <span class="file-name">{node.name}</span>
        {node.size ? <span class="file-size">{formatSize(node.size)}</span> : null}
        {node.modifiedAt ? <span class="file-date">{node.modifiedAt}</span> : null}
      </div>
      <For each={children()}>
        {(child) => (
          <FileTreeNode node={child} depth={depth + 1}
            expandedDirs={props.expandedDirs}
            searchQuery={props.searchQuery}
            onToggle={props.onToggle} />
        )}
      </For>
    </>
  )
}
