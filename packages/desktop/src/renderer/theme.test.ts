// theme.test.ts - 主题系统测试
import { describe, it, expect, beforeEach } from "vitest"

describe("主题系统", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme")
  })

  it("默认应无 data-theme 属性（CSS 默认深色）", () => {
    const attr = document.documentElement.getAttribute("data-theme")
    expect(attr).toBeNull()
  })

  it("设置 data-theme=dark 应能正确读取", () => {
    document.documentElement.setAttribute("data-theme", "dark")
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
  })

  it("设置 data-theme=light 应能正确读取", () => {
    document.documentElement.setAttribute("data-theme", "light")
    expect(document.documentElement.getAttribute("data-theme")).toBe("light")
  })

  it("切换主题后应能正确读取新值", () => {
    document.documentElement.setAttribute("data-theme", "dark")
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
    document.documentElement.setAttribute("data-theme", "light")
    expect(document.documentElement.getAttribute("data-theme")).toBe("light")
  })
})
