/**
 * Playwright 浏览器管理器
 * 管理浏览器上下文和页面会话，支持 cookie 持久化
 */
import { chromium } from "@playwright/test"
import type { BrowserContext, Page } from "@playwright/test"
import type { AppConfig } from "./config"
import type { WebAdapter } from "./adapter"
import * as fs from "fs"
import * as path from "path"

export class BrowserManager {
  private context: BrowserContext | null = null
  private sessions: Map<string, Page> = new Map()

  /**
   * 初始化浏览器实例
   */
  async init(config: AppConfig): Promise<void> {
    this.configSessionDir = config.sessionDir
    const browser = await chromium.launch({ headless: config.headless })
    this.context = await browser.newContext()

    // 恢复已持久化的 cookie
    const storageFile = path.join(config.sessionDir, "storage-state.json")
    if (fs.existsSync(storageFile)) {
      try {
        const cookies = JSON.parse(fs.readFileSync(storageFile, "utf-8"))
        await this.context.addCookies(cookies)
        console.log(`[web-wrapper] INFO  Restored ${cookies.length} cookies from ${storageFile}`)
      } catch (err) {
        console.error(`[web-wrapper] WARN  Failed to restore cookies: ${err}`)
      }
    }

    console.log(`[web-wrapper] INFO  Browser initialized (headless: ${config.headless})`)
  }

  /**
   * 获取或创建指定 session 的页面
   */
  async getSession(sessionId: string, adapter: WebAdapter): Promise<Page> {
    if (!this.context) {
      throw new Error("Browser not initialized")
    }

    if (this.sessions.has(sessionId)) {
      const page = this.sessions.get(sessionId)!
      // 检查页面是否已被关闭
      try {
        page.url()
        return page
      } catch {
        // 页面已关闭，移除并重新创建
        this.sessions.delete(sessionId)
      }
    }

    const page = await this.context.newPage()
    await page.goto(adapter.url)
    await page.waitForLoadState("networkidle")

    // 保存登录状态以备后续恢复
    await this.saveStorage()

    this.sessions.set(sessionId, page)
    console.log(`[web-wrapper] INFO  Created new session ${sessionId} for ${adapter.name}`)
    return page
  }

  /**
   * 关闭指定 session
   */
  async closeSession(sessionId: string): Promise<void> {
    const page = this.sessions.get(sessionId)
    if (page) {
      try {
        await page.close()
      } catch {
        // 页面可能已经关闭
      }
      this.sessions.delete(sessionId)
      console.log(`[web-wrapper] INFO  Closed session ${sessionId}`)
    }
  }

  /**
   * 关闭所有 session
   */
  async closeAll(): Promise<void> {
    for (const [id] of this.sessions) {
      await this.closeSession(id)
    }
    if (this.context) {
      await this.context.close()
      this.context = null
    }
    console.log("[web-wrapper] INFO  All sessions closed, browser context destroyed")
  }

  private configSessionDir: string = "./sessions"

  /**
   * 保存当前 cookie（登录状态）到文件
   */
  private async saveStorage(): Promise<void> {
    if (!this.context) return
    try {
      const storage = await this.context.storageState()
      const storageFile = path.join(this.configSessionDir, "storage-state.json")
      const dir = path.dirname(storageFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(storageFile, JSON.stringify(storage.cookies, null, 2))
      console.log(`[web-wrapper] INFO  Session cookies saved (${storage.cookies.length} cookies)`)
    } catch (err) {
      console.error(`[web-wrapper] WARN  Failed to save cookies: ${err}`)
    }
  }

  /**
   * 获取浏览器运行状态
   */
  getHealth(): { browserConnected: boolean; activeSessions: number } {
    return {
      browserConnected: this.context !== null,
      activeSessions: this.sessions.size,
    }
  }
}
