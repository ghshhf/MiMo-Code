// MemoryPanel.tsx - 接入 API 的记忆系统面板

import { createSignal, For, Show, onMount } from "solid-js"
import { fetchMemories, saveMemory, deleteMemory, type Memory as ApiMemory } from "../../stores/api"
import "./memory-styles.css"

export function MemoryPanel() {
  const [memories, setMemories] = createSignal<ApiMemory[]>([])
  const [searchQuery, setSearchQuery] = createSignal("")
  const [selectedType, setSelectedType] = createSignal<string>("all")
  const [showAddModal, setShowAddModal] = createSignal(false)
  const [isLoading, setIsLoading] = createSignal(true)
  const [editingMemory, setEditingMemory] = createSignal<ApiMemory | null>(null)

  // 加载记忆
  onMount(async () => {
    setIsLoading(true)
    const data = await fetchMemories()
    setMemories(data)
    setIsLoading(false)
  })

  // 搜索记忆
  const doSearch = async () => {
    setIsLoading(true)
    const data = await fetchMemories(searchQuery())
    setMemories(data)
    setIsLoading(false)
  }

  // 过滤
  const filteredMemories = () => {
    let result = memories()
    if (selectedType() !== "all") {
      result = result.filter(m => m.type === selectedType())
    }
    return result
  }

  // 保存记忆
  const handleSave = async (memory: Partial<ApiMemory>) => {
    if (editingMemory()) {
      // 编辑模式（本地更新）
      setMemories(prev => prev.map(m =>
        m.id === editingMemory()!.id
          ? { ...m, ...memory, updatedAt: new Date().toISOString() }
          : m
      ))
      setEditingMemory(null)
    } else {
      // 新增模式（调用 API）
      const saved = await saveMemory({
        type: (memory.type || "project") as ApiMemory["type"],
        title: memory.title || "新记忆",
        content: memory.content || "",
        tags: memory.tags || [],
      })
      setMemories(prev => [saved, ...prev])
    }
    setShowAddModal(false)
  }

  // 删除记忆
  const handleDelete = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id))
    deleteMemory(id).catch(console.warn)
  }

  return (
    <div class="memory-panel">
      <div class="memory-header">
        <h2>🧠 记忆系统</h2>
        <div class="memory-actions">
          <button class="btn-primary" onClick={() => { setEditingMemory(null); setShowAddModal(true) }}>
            ➕ 添加记忆
          </button>
        </div>
      </div>

      <div class="memory-toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="搜索记忆..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            class="search-input" />
          <Show when={searchQuery()}>
            <button class="search-clear" onClick={() => { setSearchQuery(""); doSearch() }}>✕</button>
          </Show>
        </div>
        <div class="filter-tabs">
          {["all", "user", "project", "preference"].map(type => (
            <button class={`filter-tab ${selectedType() === type ? "active" : ""}`}
              onClick={() => setSelectedType(type)}>
              {type === "all" ? "全部" : type === "user" ? "👤 用户" : type === "project" ? "📁 项目" : "⚙️ 偏好"}
            </button>
          ))}
        </div>
      </div>

      <div class="memory-list">
        <Show when={isLoading() && memories().length === 0}>
          <div class="empty-state">
            <div class="spinner" />
            <p>加载记忆中...</p>
          </div>
        </Show>

        <Show when={!isLoading() && filteredMemories().length === 0}>
          <div class="empty-state">
            <div class="empty-icon">🧠</div>
            <p>{searchQuery() ? "没有找到匹配的记忆" : "还没有记忆，点击上方添加"}</p>
          </div>
        </Show>

        <For each={filteredMemories()}>
          {(memory) => (
            <div class="memory-card">
              <div class="memory-card-header">
                <span class="memory-type-badge">
                  {memory.type === "user" ? "👤" : memory.type === "project" ? "📁" : "⚙️"}
                  <span>{memory.type}</span>
                </span>
                <div class="memory-card-actions">
                  <button class="icon-btn" title="编辑" onClick={() => { setEditingMemory(memory); setShowAddModal(true) }}>✏️</button>
                  <button class="icon-btn" title="删除" onClick={() => handleDelete(memory.id)}>🗑️</button>
                </div>
              </div>
              <h3 class="memory-title">{memory.title}</h3>
              <p class="memory-content">{memory.content}</p>
              <div class="memory-tags">
                <For each={memory.tags}>{(tag) => <span class="tag">#{tag}</span>}</For>
              </div>
              <div class="memory-meta">
                <span>更新: {new Date(memory.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </For>
      </div>

      <Show when={showAddModal()}>
        <MemoryModal
          memory={editingMemory()}
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingMemory(null) }}
        />
      </Show>
    </div>
  )
}

// 记忆编辑模态框
function MemoryModal(props: {
  memory?: ApiMemory | null
  onSave: (memory: Partial<ApiMemory>) => void
  onClose: () => void
}) {
  const [type, setType] = createSignal(props.memory?.type || "project")
  const [title, setTitle] = createSignal(props.memory?.title || "")
  const [content, setContent] = createSignal(props.memory?.content || "")
  const [tags, setTags] = createSignal(props.memory?.tags.join(", ") || "")

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
            <select value={type()} onInput={(e) => setType(e.currentTarget.value)}
              class="form-select">
              <option value="user">👤 用户</option>
              <option value="project">📁 项目</option>
              <option value="preference">⚙️ 偏好</option>
            </select>
          </div>
          <div class="form-group">
            <label>标题</label>
            <input type="text" placeholder="输入记忆标题" value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)} class="form-input" />
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea placeholder="输入记忆内容..." value={content()}
              onInput={(e) => setContent(e.currentTarget.value)} class="form-textarea" rows={4} />
          </div>
          <div class="form-group">
            <label>标签（逗号分隔）</label>
            <input type="text" placeholder="标签1, 标签2" value={tags()}
              onInput={(e) => setTags(e.currentTarget.value)} class="form-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onClick={props.onClose}>取消</button>
          <button class="btn-primary" onClick={() => {
            if (!title() || !content()) return alert("请填写标题和内容")
            props.onSave({
              type: type() as any,
              title: title(),
              content: content(),
              tags: tags().split(",").map(t => t.trim()).filter(Boolean)
            })
          }}>{props.memory ? "保存修改" : "添加记忆"}</button>
        </div>
      </div>
    </div>
  )
}
