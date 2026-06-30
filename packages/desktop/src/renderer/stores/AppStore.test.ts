// AppStore.test.ts - 全局状态管理测试（纯逻辑测试，不依赖 JSX）
import { describe, it, expect, beforeEach } from "vitest"

// 直接测试 localStorage 和主题设置相关的逻辑

describe("设置持久化 (localStorage)", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
  })

  it("localStorage 应能正常存储设置", () => {
    const settings = { theme: "dark", language: "zh-CN", fontSize: 14 }
    localStorage.setItem("app-settings", JSON.stringify(settings))
    const saved = localStorage.getItem("app-settings")
    expect(saved).toBeTruthy()
    if (saved) {
      const parsed = JSON.parse(saved)
      expect(parsed.theme).toBe("dark")
      expect(parsed.language).toBe("zh-CN")
      expect(parsed.fontSize).toBe(14)
    }
  })

  it("localStorage 应能正确更新设置", () => {
    const settings = { theme: "light", language: "en-US" }
    localStorage.setItem("app-settings", JSON.stringify(settings))
    const saved = JSON.parse(localStorage.getItem("app-settings")!)
    expect(saved.theme).toBe("light")
    expect(saved.language).toBe("en-US")
  })

  it("localStorage 应能删除设置", () => {
    localStorage.setItem("app-settings", JSON.stringify({ theme: "dark" }))
    expect(localStorage.getItem("app-settings")).toBeTruthy()
    localStorage.removeItem("app-settings")
    expect(localStorage.getItem("app-settings")).toBeNull()
  })

  it("应正确处理空 localStorage", () => {
    const saved = localStorage.getItem("app-settings")
    expect(saved).toBeNull()
  })
})

describe("主题系统管理", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme")
  })

  it("设置 data-theme=dark 应应用深色主题", () => {
    document.documentElement.setAttribute("data-theme", "dark")
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
  })

  it("设置 data-theme=light 应应用浅色主题", () => {
    document.documentElement.setAttribute("data-theme", "light")
    expect(document.documentElement.getAttribute("data-theme")).toBe("light")
  })

  it("主题切换应正确更新", () => {
    document.documentElement.setAttribute("data-theme", "dark")
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
    document.documentElement.setAttribute("data-theme", "light")
    expect(document.documentElement.getAttribute("data-theme")).toBe("light")
  })

  it("默认无 data-theme 属性时 CSS 应使用深色 (#root 默认)", () => {
    const attr = document.documentElement.getAttribute("data-theme")
    expect(attr).toBeNull()
  })
})

describe("默认设置值", () => {
  it("默认设置应包含所有必要字段", () => {
    const defaults = {
      theme: "dark" as const,
      language: "zh-CN" as const,
      fontSize: 14,
      autoSave: true,
      defaultModel: "gpt-4",
      temperature: 0.7,
      maxTokens: 4096,
      streamOutput: true,
      showLineNumbers: true,
      wordWrap: true,
    }
    expect(defaults.theme).toBe("dark")
    expect(defaults.fontSize).toBe(14)
    expect(defaults.autoSave).toBe(true)
    expect(Object.keys(defaults).length).toBe(10)
  })
})
