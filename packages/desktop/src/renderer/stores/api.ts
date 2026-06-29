// api.ts - 与 MiMo 侧车（Sidecar）服务通信的 API 层
// 提供统一的接口，供所有面板使用

// ============ 消息 API ============

// 发送聊天消息并获取回复（流式）
export async function sendChatMessage(
  message: string,
  onStream?: (chunk: string) => void,
  options?: { model?: string; temperature?: number }
): Promise<string> {
  // 先尝试连接本地侧车
  const url = await getSidecarUrl()
  if (url) {
    try {
      return await streamChat(url, message, onStream, options)
    } catch (err) {
      console.warn("[api] sidecar chat failed, falling back to mock:", err)
    }
  }

  // 侧车不可用 -> 模拟回复
  return mockChatResponse(message, onStream)
}

// 通过侧车 API 流式聊天
async function streamChat(
  baseUrl: string,
  message: string,
  onStream?: (chunk: string) => void,
  options?: { model?: string; temperature?: number }
): Promise<string> {
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: options?.model ?? "miMo-v2.5",
      messages: [{ role: "user", content: message }],
      temperature: options?.temperature ?? 0.7,
      stream: onStream != null,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  if (onStream && response.body) {
    // 流式读取
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      // 解析 SSE 格式
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data === "[DONE]") continue
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content || ""
            if (content) {
              fullContent += content
              onStream(content)
            }
          } catch {}
        }
      }
    }
    return fullContent
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ""
}

// 模拟聊天回复（降级方案）
async function mockChatResponse(
  message: string,
  onStream?: (chunk: string) => void
): Promise<string> {
  const responses = [
    `收到你的问题："${message}"\n\n这是一个模拟回复。当前侧车服务未连接，请确保 MiMo 后端正在运行。`,
    `关于"${message}"，我很乐意帮你。但需要先连接到 MiMo 服务。\n\n你可以尝试：\n1. 启动 MiMo 后端服务\n2. 检查网络连接\n3. 在设置中配置 API Key`,
  ]
  const reply = responses[Math.floor(Math.random() * responses.length)]

  if (onStream) {
    for (let i = 0; i < reply.length; i++) {
      onStream(reply[i])
      await new Promise(r => setTimeout(r, 10 + Math.random() * 30))
    }
  }

  return reply
}

// ============ Agent API ============

export interface AgentTask {
  id: string
  type: "build" | "plan" | "compose"
  status: "pending" | "running" | "completed" | "error"
  progress: number
  currentStep: string
  steps: { name: string; status: string }[]
}

export async function startAgentTask(
  type: AgentTask["type"],
  prompt: string,
  onProgress?: (task: Partial<AgentTask>) => void
): Promise<AgentTask> {
  const url = await getSidecarUrl()
  if (url) {
    try {
      return await streamAgentTask(url, type, prompt, onProgress)
    } catch (err) {
      console.warn("[api] sidecar agent failed, using mock:", err)
    }
  }
  return mockAgentTask(type, prompt, onProgress)
}

async function streamAgentTask(
  baseUrl: string,
  type: AgentTask["type"],
  prompt: string,
  onProgress?: (task: Partial<AgentTask>) => void
): Promise<AgentTask> {
  const response = await fetch(`${baseUrl}/v1/agent/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, prompt }),
  })
  return response.json()
}

async function mockAgentTask(
  type: AgentTask["type"],
  prompt: string,
  onProgress?: (task: Partial<AgentTask>) => void
): Promise<AgentTask> {
  const steps = [
    { name: "分析需求", status: "pending" },
    { name: "搜索上下文", status: "pending" },
    { name: "执行任务", status: "pending" },
    { name: "生成结果", status: "pending" },
  ]

  const task: AgentTask = {
    id: Date.now().toString(),
    type,
    status: "running",
    progress: 0,
    currentStep: "分析需求",
    steps,
  }

  for (let i = 0; i < steps.length; i++) {
    await new Promise(r => setTimeout(r, 1500))
    steps[i].status = "completed"
    task.progress = Math.round(((i + 1) / steps.length) * 100)
    task.currentStep = steps[i].name
    if (i < steps.length - 1) {
      steps[i + 1].status = "running"
      task.currentStep = steps[i + 1].name
    }
    onProgress?.({ ...task, steps: [...steps] })
  }

  task.status = "completed"
  task.progress = 100
  task.currentStep = "完成"
  return task
}

// ============ 记忆 API ============

export interface Memory {
  id: string
  type: "user" | "project" | "preference"
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export async function fetchMemories(query?: string): Promise<Memory[]> {
  const url = await getSidecarUrl()
  if (url) {
    try {
      const params = query ? `?q=${encodeURIComponent(query)}` : ""
      const resp = await fetch(`${url}/v1/memory${params}`)
      if (resp.ok) return resp.json()
    } catch {}
  }
  return mockMemories(query)
}

export async function saveMemory(memory: Omit<Memory, "id" | "createdAt" | "updatedAt">): Promise<Memory> {
  const url = await getSidecarUrl()
  if (url) {
    try {
      const resp = await fetch(`${url}/v1/memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memory),
      })
      if (resp.ok) return resp.json()
    } catch {}
  }
  return {
    id: Date.now().toString(),
    ...memory,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export async function deleteMemory(id: string): Promise<void> {
  const url = await getSidecarUrl()
  if (url) {
    try {
      await fetch(`${url}/v1/memory/${id}`, { method: "DELETE" })
    } catch {}
  }
}

// 模拟记忆数据
const mockData: Memory[] = [
  { id: "1", type: "user", title: "用户偏好", content: "用户喜欢简洁的界面", tags: ["偏好", "UI"], createdAt: "2024-01-15", updatedAt: "2024-01-20" },
  { id: "2", type: "project", title: "项目结构", content: "SolidJS + Electron monorepo", tags: ["项目", "架构"], createdAt: "2024-01-18", updatedAt: "2024-01-22" },
  { id: "3", type: "preference", title: "代码风格", content: "TypeScript, 明确的类型定义", tags: ["代码", "TS"], createdAt: "2024-01-10", updatedAt: "2024-01-25" },
]

function mockMemories(query?: string): Memory[] {
  if (!query) return mockData
  return mockData.filter(m =>
    m.title.includes(query) || m.content.includes(query) || m.tags.some(t => t.includes(query))
  )
}

// ============ 项目 API ============

export interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  size?: number
  modifiedAt?: string
  children?: FileNode[]
}

export async function fetchProjectFiles(projectPath: string): Promise<FileNode[]> {
  const url = await getSidecarUrl()
  if (url) {
    try {
      const resp = await fetch(`${url}/v1/project/files?path=${encodeURIComponent(projectPath)}`)
      if (resp.ok) return resp.json()
    } catch {}
  }
  return mockFileTree()
}

function mockFileTree(): FileNode[] {
  return [
    { name: "src", path: "/src", type: "directory", children: [
      { name: "main", path: "/src/main", type: "directory", children: [
        { name: "index.ts", path: "/src/main/index.ts", type: "file", size: 3200, modifiedAt: "2024-06-28" },
        { name: "windows.ts", path: "/src/main/windows.ts", type: "file", size: 5500, modifiedAt: "2024-06-27" },
      ]},
      { name: "renderer", path: "/src/renderer", type: "directory", children: [
        { name: "index.tsx", path: "/src/renderer/index.tsx", type: "file", size: 2800, modifiedAt: "2024-06-29" },
        { name: "styles.css", path: "/src/renderer/styles.css", type: "file", size: 12000, modifiedAt: "2024-06-28" },
      ]},
    ]},
    { name: "package.json", path: "/package.json", type: "file", size: 800, modifiedAt: "2024-06-29" },
    { name: "tsconfig.json", path: "/tsconfig.json", type: "file", size: 400, modifiedAt: "2024-06-25" },
  ]
}

// ============ 工具函数 ============

async function getSidecarUrl(): Promise<string | null> {
  // 通过 window.api 获取侧车地址
  try {
    if (typeof window.api !== "undefined" && window.api.getSidecarUrl) {
      const url = await (window.api as any).getSidecarUrl()
      if (url) return url
    }
  } catch {}

  // 默认开发地址
  // 检查多个常见端口
  for (const port of [5173, 3000, 8080]) {
    try {
      const resp = await fetch(`http://localhost:${port}/health`, {
        signal: AbortSignal.timeout(1000),
      })
      if (resp.ok) return `http://localhost:${port}`
    } catch {}
  }
  return null
}

// 声明全局 window.api 类型
declare global {
  interface Window {
    api: Record<string, any>
  }
}
