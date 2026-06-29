import { createSignal, For, Show } from "solid-js"
import "./memory-styles.css"

// 记忆类型定义
interface Memory {
  id: string
  type: "user" | "project" | "preference"
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// 模拟记忆数据
const mockMemories: Memory[] = [
  {
    id: "1",
    type: "user",
    title: "用户偏好",
    content: "用户喜欢简洁的界面设计，倾向于使用快捷键操作",
    tags: ["偏好", "UI"],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "2",
    type: "project",
    title: "当前项目结构",
    content: "项目使用 SolidJS + Electron，采用 monorepo 架构，packages/ 下有多个子包",
    tags: ["项目", "架构"],
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-22")
  },
  {
    id: "3",
    type: "preference",
    title: "代码风格",
    content: "用户偏好使用 TypeScript，喜欢明确的类型定义，不使用 any",
    tags: ["代码", "TypeScript"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-25")
  }
]

export function MemoryPanel() {
  const [memories, setMemories] = createSignal<Memory[]>(mockMemories)
  const [searchQuery, setSearchQuery] = createSignal("")
  const [selectedType, setSelectedType] = createSignal<string>("all")
  const [showAddModal, setShowAddModal] = createSignal(false)
  const [editingMemory, setEditingMemory] = createSignal<Memory | null>(null)

  // 过滤记忆
  const filteredMemories = () => {
    let result = memories()

    // 按类型过滤
    if (selectedType() !== "all") {
      result = result.filter(m => m.type === selectedType())
    }

    // 按搜索词过滤
    const query = searchQuery().toLowerCase()
    if (query) {
      result = result.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.content.toLowerCase().includes(query) ||
        m.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    return result
  }

  // 添加/编辑记忆
  const saveMemory = (memory: Partial<Memory>) => {
    if (editingMemory()) {
      // 编辑模式
      setMemories(prev => prev.map(m =>
        m.id === editingMemory()!.id
          ? { ...m, ...memory, updatedAt: new Date() }
          : m
      ))
      setEditingMemory(null)
    } else {
      // 添加模式
      const newMemory: Memory = {
        id: Date.now().toString(),
        type: memory.type as Memory["type"] || "project",
        title: memory.title || "新记忆",
        content: memory.content || "",
        tags: memory.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setMemories(prev => [newMemory, ...prev])
    }
    setShowAddModal(false)
  }

  // 删除记忆
  const deleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div class="memory-panel">
      {/* 头部 */}
      <div class="memory-header">
        <h2>🧠 记忆系统</h2>
        <div class="memory-actions">
          <button
            class="btn-primary"
            onClick={() => {
              setEditingMemory(null)
              setShowAddModal(true)
            }}
          >
            ➕ 添加记忆
          </button>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div class="memory-toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="搜索记忆..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            class="search-input"
          />
        </div>

        <div class="filter-tabs">
          <button
            class={`filter-tab ${selectedType() === "all" ? "active" : ""}`}
            onClick={() => setSelectedType("all")}
          >
            全部
          </button>
          <button
            class={`filter-tab ${selectedType() === "user" ? "active" : ""}`}
            onClick={() => setSelectedType("user")}
          >
            👤 用户
          </button>
          <button
            class={`filter-tab ${selectedType() === "project" ? "active" : ""}`}
            onClick={() => setSelectedType("project")}
          >
            📁 项目
          </button>
          <button
            class={`filter-tab ${selectedType() === "preference" ? "active" : ""}`}
            onClick={() => setSelectedType("preference")}
          >
            ⚙️ 偏好
          </button>
        </div>
      </div>

      {/* 记忆列表 */}
      <div class="memory-list">
        <For each={filteredMemories()}>
          {(memory) => (
            <div class="memory-card">
              <div class="memory-card-header">
                <div class="memory-type-badge">
                  {memory.type === "user" && "👤"}
                  {memory.type === "project" && "📁"}
                  {memory.type === "preference" && "⚙️"}
                  <span>{memory.type}</span>
                </div>
                <div class="memory-card-actions">
                  <button
                    class="icon-btn"
                    title="编辑"
                    onClick={() => {
                      setEditingMemory(memory)
                      setShowAddModal(true)
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    class="icon-btn"
                    title="删除"
                    onClick={() => deleteMemory(memory.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <h3 class="memory-title">{memory.title}</h3>
              <p class="memory-content">{memory.content}</p>

              <div class="memory-tags">
                <For each={memory.tags}>
                  {(tag) => <span class="tag">#{tag}</span>}
                </For>
              </div>

              <div class="memory-meta">
                <span>创建: {memory.createdAt.toLocaleDateString()}</span>
                <span>更新: {memory.updatedAt.toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </For>

        <Show when={filteredMemories().length === 0}>
          <div class="empty-state">
            <div class="empty-icon">🧠</div>
            <p>没有找到匹配的记忆</p>
            <button
              class="btn-secondary"
              onClick={() => {
                setSearchQuery("")
                setSelectedType("all")
              }}
            >
              清除过滤
            </button>
          </div>
        </Show>
      </div>

      {/* 添加/编辑模态框 */}
      <Show when={showAddModal()}>
        <MemoryModal
          memory={editingMemory()}
          onSave={saveMemory}
          onClose={() => {
            setShowAddModal(false)
            setEditingMemory(null)
          }}
        />
      </Show>
    </div>
  )
}

// 记忆编辑模态框
function MemoryModal(props: {
  memory?: Memory | null
  onSave: (memory: Partial<Memory>) => void
  onClose: () => void
}) {
  const [type, setType] = createSignal(props.memory?.type || "project")
  const [title, setTitle] = createSignal(props.memory?.title || "")
  const [content, setContent] = createSignal(props.memory?.content || "")
  const [tags, setTags] = createSignal(props.memory?.tags.join(", ") || "")

  const handleSubmit = () => {
    if (!title() || !content()) {
      alert("请填写标题和内容")
      return
    }

    props.onSave({
      type: type(),
      title: title(),
      content: content(),
      tags: tags().split(",").map(t => t.trim()).filter(Boolean)
    })
  }

  return (
    <div class="modal-overlay" onClick={props.onClose}>
      <div class="modal-content" onClick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h3>{props.memory ? "编辑记忆" : "添加新记忆"}</h3>
          <button class="close-btn" onClick={props.onClose}>✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>类型</label>
            <select
              value={type()}
              onInput={(e) => setType(e.currentTarget.value as Memory["type"])}
              class="form-select"
            >
              <option value="user">👤 用户</option>
              <option value="project">📁 项目</option>
              <option value="preference">⚙️ 偏好</option>
            </select>
          </div>

          <div class="form-group">
            <label>标题</label>
            <input
              type="text"
              placeholder="输入记忆标题"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>内容</label>
            <textarea
              placeholder="输入记忆内容..."
              value={content()}
              onInput={(e) => setContent(e.currentTarget.value)}
              class="form-textarea"
              rows={4}
            />
          </div>

          <div class="form-group">
            <label>标签（逗号分隔）</label>
            <input
              type="text"
              placeholder="标签1, 标签2, 标签3"
              value={tags()}
              onInput={(e) => setTags(e.currentTarget.value)}
              class="form-input"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" onClick={props.onClose}>
            取消
          </button>
          <button class="btn-primary" onClick={handleSubmit}>
            {props.memory ? "保存修改" : "添加记忆"}
          </button>
        </div>
      </div>
    </div>
  )
}
