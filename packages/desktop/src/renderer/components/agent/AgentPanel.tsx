// AgentPanel.tsx - 接入 API 的 Agent 面板

import { createSignal, For, Show } from "solid-js"
import { startAgentTask, type AgentTask } from "../../stores/api"
import "./agent-styles.css"

const agentTypes = [
  { id: "build" as const, icon: "🔨", label: "Build", desc: "完整工具权限，用于开发" },
  { id: "plan" as const, icon: "📋", label: "Plan", desc: "只读分析模式，代码探索" },
  { id: "compose" as const, icon: "🎼", label: "Compose", desc: "编排模式，specs-driven" },
]

export function AgentPanel() {
  const [tasks, setTasks] = createSignal<AgentTask[]>([])
  const [input, setInput] = createSignal("")
  const [selectedType, setSelectedType] = createSignal<AgentTask["type"]>("build")

  const startNewTask = async () => {
    const type = selectedType()
    const prompt = input().trim() || `执行 ${type} 任务`

    // 创建临时任务
    const tempTask: AgentTask = {
      id: Date.now().toString(),
      type,
      status: "running",
      progress: 0,
      currentStep: "启动中...",
      steps: [
        { name: "分析需求", status: "running" },
        { name: "搜索上下文", status: "pending" },
        { name: "执行任务", status: "pending" },
        { name: "生成结果", status: "pending" },
      ],
    }
    setTasks(prev => [...prev, tempTask])
    setInput("")

    // 调用 API
    const result = await startAgentTask(type, prompt, (progress) => {
      setTasks(prev => prev.map(t =>
        t.id === tempTask.id ? { ...t, ...progress } : t
      ))
    })

    setTasks(prev => prev.map(t =>
      t.id === tempTask.id ? result : t
    ))
  }

  const stopTask = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: "error" } : t
    ))
  }

  const clearCompleted = () => {
    setTasks(prev => prev.filter(t => t.status === "running"))
  }

  return (
    <div class="agent-panel">
      <div class="agent-header">
        <h2>🤖 Agent 管理</h2>
        <div class="agent-actions">
          <button class="action-btn" onClick={clearCompleted} title="清除已完成">
            🗑️ 清除
          </button>
        </div>
      </div>

      {/* Agent 类型选择 */}
      <div class="agent-type-selector">
        <For each={agentTypes}>
          {(at) => (
            <button class={`agent-type-card ${selectedType() === at.id ? "active" : ""}`}
              onClick={() => setSelectedType(at.id)}>
              <span class="type-icon">{at.icon}</span>
              <span class="type-label">{at.label}</span>
              <span class="type-desc">{at.desc}</span>
            </button>
          )}
        </For>
      </div>

      {/* 输入区域 */}
      <div class="agent-input-area">
        <input type="text" class="agent-input"
          placeholder="输入任务描述（可选）..."
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && startNewTask()} />
        <button class="start-btn" onClick={startNewTask}>
          🚀 启动 {agentTypes.find(a => a.id === selectedType())?.label}
        </button>
      </div>

      {/* 任务列表 */}
      <div class="agent-task-list">
        <For each={tasks()}>
          {(task) => (
            <div class={`agent-task ${task.status}`}>
              <div class="task-header">
                <span class="task-icon">
                  {agentTypes.find(a => a.id === task.type)?.icon || "🔧"}
                </span>
                <span class="task-type">{task.type}</span>
                <span class="task-status-badge">{task.status}</span>
              </div>

              <Show when={task.status === "running"}>
                <div class="task-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style={{ width: `${task.progress}%` }} />
                  </div>
                  <span class="progress-text">{task.progress}%</span>
                </div>
                <div class="task-current">
                  <span class="current-step-label">当前: {task.currentStep}</span>
                  <button class="stop-btn" onClick={() => stopTask(task.id)}>⏹ 停止</button>
                </div>
              </Show>

              <Show when={task.status === "completed"}>
                <div class="task-completed">
                  <span class="completed-badge">✅ 完成 ({task.progress}%)</span>
                </div>
              </Show>

              {/* 步骤列表 */}
              <div class="task-steps">
                <For each={task.steps}>
                  {(step) => (
                    <div class="step-item" classList={{ completed: step.status === "completed", running: step.status === "running", pending: step.status === "pending" }}>
                      <span class="step-bullet">
                        {step.status === "completed" ? "✓" : step.status === "running" ? "●" : "○"}
                      </span>
                      <span>{step.name}</span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>

        <Show when={tasks().length === 0}>
          <div class="empty-state">
            <div class="empty-icon">🤖</div>
            <p>选择 Agent 类型并启动任务</p>
          </div>
        </Show>
      </div>
    </div>
  )
}
