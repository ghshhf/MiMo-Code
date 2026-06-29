import { createSignal, For, Show } from "solid-js"
import "./project-styles.css"

// 文件树节点
interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileNode[]
  isExpanded?: boolean
  size?: number
  modifiedAt?: Date
}

// 模拟项目文件树
const mockProjectTree: FileNode[] = [
  {
    name: "src",
    path: "/src",
    type: "directory",
    isExpanded: true,
    children: [
      {
        name: "components",
        path: "/src/components",
        type: "directory",
        children: [
          { name: "App.tsx", path: "/src/components/App.tsx", type: "file", size: 2048, modifiedAt: new Date() },
          { name: "Header.tsx", path: "/src/components/Header.tsx", type: "file", size: 1024, modifiedAt: new Date() }
        ]
      },
      { name: "index.tsx", path: "/src/index.tsx", type: "file", size: 512, modifiedAt: new Date() },
      { name: "styles.css", path: "/src/styles.css", type: "file", size: 3072, modifiedAt: new Date() }
    ]
  },
  {
    name: "packages",
    path: "/packages",
    type: "directory",
    children: [
      { name: "desktop", path: "/packages/desktop", type: "directory", children: [] },
      { name: "opencode", path: "/packages/opencode", type: "directory", children: [] }
    ]
  },
  { name: "package.json", path: "/package.json", type: "file", size: 1536, modifiedAt: new Date() },
  { name: "tsconfig.json", path: "/tsconfig.json", type: "file", size: 768, modifiedAt: new Date() },
  { name: "README.md", path: "/README.md", type: "file", size: 4096, modifiedAt: new Date() }
]

export function ProjectPanel() {
  const [files, setFiles] = createSignal<FileNode[]>(mockProjectTree)
  const [selectedFile, setSelectedFile] = createSignal<string | null>(null)
  const [searchQuery, setSearchQuery] = createSignal("")
  const [showHidden, setShowHidden] = createSignal(false)

  // 切换目录展开状态
  const toggleExpand = (path: string) => {
    const updateNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === path) {
          return { ...node, isExpanded: !node.isExpanded }
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) }
        }
        return node
      })
    }
    setFiles(updateNodes(files()))
  }

  // 选择文件
  const selectFile = (path: string) => {
    setSelectedFile(path)
    // 这里可以触发打开文件的逻辑
    console.log("打开文件:", path)
  }

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // 获取文件图标
  const getFileIcon = (name: string) => {
    if (name.endsWith(".tsx") || name.endsWith(".ts")) return "📄"
    if (name.endsWith(".css")) return "🎨"
    if (name.endsWith(".json")) return "📋"
    if (name.endsWith(".md")) return "📝"
    if (name.endsWith(".png") || name.endsWith(".jpg")) return "🖼️"
    return "📄"
  }

  // 递归渲染文件树
  const renderFileTree = (nodes: FileNode[], depth: number = 0) => {
    return (
      <For each={nodes}>
        {(node) => (
          <div>
            <div
              class={`file-item ${selectedFile() === node.path ? "selected" : ""}`}
              style={{ paddingLeft: `${depth * 20 + 12}px` }}
              onClick={() => {
                if (node.type === "directory") {
                  toggleExpand(node.path)
                } else {
                  selectFile(node.path)
                }
              }}
            >
              <span class="file-icon">
                {node.type === "directory"
                  ? (node.isExpanded ? "📂" : "📁")
                  : getFileIcon(node.name)
                }
              </span>
              <span class="file-name">{node.name}</span>
              {node.type === "file" && node.size && (
                <span class="file-size">{formatSize(node.size)}</span>
              )}
            </div>
            {node.type === "directory" && node.isExpanded && node.children && (
              <div class="file-children">
                {renderFileTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        )}
      </For>
    )
  }

  return (
    <div class="project-panel">
      {/* 头部 */}
      <div class="project-header">
        <h2>📁 项目管理</h2>
        <div class="project-actions">
          <button class="btn-icon" title="新建文件">➕</button>
          <button class="btn-icon" title="新建文件夹">📁</button>
          <button class="btn-icon" title="刷新">🔄</button>
        </div>
      </div>

      {/* 项目信息 */}
      <div class="project-info">
        <div class="project-name">MiMo-Code Desktop</div>
        <div class="project-path">/c/Users/123/mimo-desktop</div>
      </div>

      {/* 搜索 */}
      <div class="project-search">
        <input
          type="text"
          placeholder="搜索文件..."
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          class="search-input"
        />
      </div>

      {/* 文件树 */}
      <div class="file-tree">
        {renderFileTree(files())}
      </div>

      {/* 底部状态 */}
      <div class="project-status">
        <span class="status-text">
          {files().length} 个项目根目录
        </span>
        <label class="show-hidden">
          <input
            type="checkbox"
            checked={showHidden()}
            onInput={(e) => setShowHidden(e.currentTarget.checked)}
          />
          显示隐藏文件
        </label>
      </div>
    </div>
  )
}
