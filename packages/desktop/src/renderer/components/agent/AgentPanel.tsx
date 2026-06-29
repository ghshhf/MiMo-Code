// AgentPanel.tsx - Agent 管理和可视化面板

import { createSignal, For, Show } from "solid-js"

export interface AgentInfo {
  id: string
  name: string
  type: "build" | "plan" | "compose"
  status: "idle" | "running" | "completed" | "error"
  progress: number
  currentTask?: string
  steps: AgentStep[]
}

export interface AgentStep {
  id: string
  name: string
  status: "pending" | "running" | "completed" | "error"
  duration?: number
}

export function AgentPanel() {
  const [agents, setAgents] = createSignal<AgentInfo[]>([
    {
      id: "1",
      name: "build",
      type: "build",
      status: "idle",
      progress: 0,
      steps: [
        { id: "1", name: "分析需求", status: "pending" },
        { id: "2", name: "编写代码", status: "pending" },
        { id: "3", name: "运行测试", status: "pending" },
      ]
    }
  ])
  
  const [selectedAgent, setSelectedAgent] = createSignal<string | null>(null)

  // 启动 Agent
  const startAgent = (type: AgentInfo["type"]) => {
    const newAgent: AgentInfo = {
      id: Date.now().toString(),
      name: type,
      type,
      status: "running",
      progress: 0,
      currentTask: "准备中...",
      steps: [
        { id: Date.now().toString(), name: "初始化", status: "running" },
        { id: (Date.now() + 1).toString(), name: "执行任务", status: "pending" },
        { id: (Date.now() + 2).toString(), name: "生成报告", status: "pending" },
      ]
    }
    setAgents([...agents(), newAgent])
    
    // 模拟执行
    simulateAgentExecution(newAgent.id)
  }

  // 模拟 Agent 执行
  const simulateAgentExecution = (agentId: string) => {
    const steps = ["初始化", "分析代码", "执行任务", "生成报告"]
    let stepIndex = 0
    
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.id !== agentId) return agent
        
        if (stepIndex < steps.length) {
          const updatedSteps = [...agent.steps]
          if (stepIndex > 0) {
            updatedSteps[stepIndex - 1].status = "completed"
            updatedSteps[stepIndex - 1].duration = 1000
          }
          if (stepIndex < steps.length) {
            updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], status: "running" }
          }
          
          return {
            ...agent,
            currentTask: steps[stepIndex],
            progress: Math.round((stepIndex / steps.length) * 100),
            steps: updatedSteps
          }
        } else {
          clearInterval(interval)
          return {
            ...agent,
            status: "completed",
            progress: 100,
            currentTask: "完成",
            steps: agent.steps.map(s => ({ ...s, status: "completed" as const, duration: 1000 }))
          }
        }
      }))
      
      stepIndex++
    }, 1500)
  }

  // 停止 Agent
  const stopAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status: "idle" } : a
    ))
  }

  const getAgentIcon = (type: AgentInfo["type"]) => {
    switch (type) {
      case "build": return "🔨"
      case "plan": return "📋"
      case "compose": return "🎼"
    }
  }

  const getStatusColor = (status: AgentInfo["status"]) => {
    switch (status) {
      case "idle": return "var(--color-text-muted)"
      case "running": return "var(--color-primary)"
      case "completed": return "#10b981"
      case "error": return "#ef4444"
    }
  }

  return (
    <div class="agent-panel">
      {/* 顶部工具栏 */}
      <div class="agent-header">
        <h2>🤖 Agent 管理</h2>
        <div class="agent-actions">
          <button class="action-btn" onClick={() => startAgent("build")}>
            + Build
          </button>
          <button class="action-btn" onClick={() => startAgent("plan")}>
            + Plan
          </button>
          <button class="action-btn" onClick={() => startAgent("compose")}>
            + Compose
          </button>
        </div>
      </div>

      {/* Agent 列表 */}
      <div class="agent-list">
        <For each={agents()}>
          {(agent) => (
            <div
              class="agent-card"
              classList={{ active: selectedAgent() === agent.id }}
              onClick={() => setSelectedAgent(agent.id)}
            >
              <div class="agent-card-header">
                <div class="agent-info">
                  <span class="agent-icon">{getAgentIcon(agent.type)}</span>
                  <span class="agent-name">{agent.name}</span>
                </div>
                <div class="agent-status" style={{ color: getStatusColor(agent.status) }}>
                  {agent.status}
                </div>
              </div>

              {/* 进度条 */}
              <Show when={agent.status === "running"}>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
                <div class="current-task">
                  当前: {agent.currentTask}
                </div>
              </Show>

              {/* 操作按钮 */}
              <div class="agent-card-actions">
                <Show when={agent.status === "running"}>
                  <button class="stop-btn" onClick={(e) => {
                    e.stopPropagation()
                    stopAgent(agent.id)
                  }}>
                    停止
                  </button>
                </Show>
                <Show when={agent.status === "completed"}>
                  <span class="completed-badge">✓ 完成</span>
                </Show>
              </div>

              {/* 步骤列表 */}
              <Show when={selectedAgent() === agent.id}>
                <div class="agent-steps">
                  <For each={agent.steps}>
                    {(step) => (
                      <div class="step-item" classList={{ 
                        running: step.status === "running",
                        completed: step.status === "completed",
                        error: step.status === "error"
                      }}>
                        <span class="step-icon">
                          {step.status === "completed" ? "✓" : step.status === "running" ? "⚡" : "○"}
                        </span>
                        <span class="step-name">{step.name}</span>
                        <Show when={step.duration}>
                          <span class="step-duration">{step.duration}ms</span>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

/* 样式在 new-styles.css 中 */
