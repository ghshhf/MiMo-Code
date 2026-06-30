// api.test.ts - API 服务层单元测试
import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock fetch
const mockFetch = vi.fn()
globalThis.fetch = mockFetch as any

// Mock AbortSignal.timeout
AbortSignal.timeout = vi.fn(() => new AbortController().signal)

// Import after mocks
import { sendChatMessage, fetchMemories, saveMemory, deleteMemory, startAgentTask } from "./api"

describe("sendChatMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("应降级到模拟回复当侧车不可用", async () => {
    mockFetch.mockRejectedValue(new Error("connection refused"))
    const result = await sendChatMessage("你好")
    expect(result).toContain("你好")
    expect(result.length).toBeGreaterThan(20)
  })

  it("应返回模拟回复且不为空", async () => {
    mockFetch.mockRejectedValue(new Error("offline"))
    const result = await sendChatMessage("测试消息")
    expect(result).toBeTruthy()
    expect(result.length).toBeGreaterThan(10)
  })

  it("应支持流式回调（模拟模式）", async () => {
    mockFetch.mockRejectedValue(new Error("offline"))
    const chunks: string[] = []
    const result = await sendChatMessage("流式测试", (chunk) => {
      chunks.push(chunk)
    })
    expect(result).toBeTruthy()
    expect(chunks.length).toBeGreaterThan(0)
    expect(chunks.join("")).toBe(result)
  })
})

describe("fetchMemories", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("应返回模拟记忆数据当侧车不可用", async () => {
    mockFetch.mockRejectedValue(new Error("offline"))
    const memories = await fetchMemories()
    expect(Array.isArray(memories)).toBe(true)
    expect(memories.length).toBeGreaterThan(0)
  })

  it("应过滤记忆当提供搜索词", async () => {
    mockFetch.mockRejectedValue(new Error("offline"))
    const memories = await fetchMemories("TypeScript")
    expect(memories.length).toBeGreaterThan(0)
    expect(memories.some(m => m.title.toLowerCase().includes("typescript") || m.content.toLowerCase().includes("typescript"))).toBe(true)
  })

  it("记忆对象应包含必要字段", async () => {
    mockFetch.mockRejectedValue(new Error("offline"))
    const memories = await fetchMemories()
    for (const m of memories) {
      expect(m).toHaveProperty("id")
      expect(m).toHaveProperty("type")
      expect(m).toHaveProperty("title")
      expect(m).toHaveProperty("content")
      expect(m).toHaveProperty("tags")
      expect(m).toHaveProperty("createdAt")
    }
  })
})

describe("saveMemory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("应在离线时返回本地新建的记忆对象", async () => {
    mockFetch.mockRejectedValue(new Error("offline"))
    const result = await saveMemory({
      type: "user",
      title: "测试记忆",
      content: "测试内容",
      tags: ["测试"],
    })
    expect(result).toHaveProperty("id")
    expect(result.title).toBe("测试记忆")
    expect(result.type).toBe("user")
    expect(result.tags).toEqual(["测试"])
  })
})

describe("deleteMemory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("不应抛出异常当侧车不可用", async () => {
    mockFetch.mockRejectedValue(new Error("offline"))
    await expect(deleteMemory("test-id")).resolves.toBeUndefined()
  })
})

describe("startAgentTask", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("应在离线时返回模拟任务且最终状态为 completed", async () => {
    mockFetch.mockRejectedValue(new Error("offline"))
    const task = await startAgentTask("build", "测试任务")
    expect(task).toHaveProperty("id")
    expect(task.type).toBe("build")
    expect(task.status).toBe("completed")
    expect(task.progress).toBe(100)
  })

  it("应支持进度回调", async () => {
    mockFetch.mockRejectedValue(new Error("offline"))
    const updates: number[] = []
    await startAgentTask("plan", "分析测试", (progress) => {
      if (progress.progress !== undefined) updates.push(progress.progress)
    })
    expect(updates.length).toBeGreaterThan(0)
    expect(updates[updates.length - 1]).toBe(100)
  })
})
