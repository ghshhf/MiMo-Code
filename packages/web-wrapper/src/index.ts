#!/usr/bin/env bun
/**
 * Web Wrapper 入口
 * 启动 Hono HTTP 服务并初始化 Playwright 浏览器
 *
 * 使用方法：
 *   bun run src/index.ts
 *   # 或指定端口
 *   WEB_WRAPPER_PORT=3456 bun run src/index.ts
 */
import { serve } from "./server"
import { loadConfig } from "./config"
import { BrowserManager } from "./browser"
import { DeepSeekWebAdapter } from "./adapters/deepseek"

const config = loadConfig()
const browser = new BrowserManager()
const adapter = new DeepSeekWebAdapter()

async function main(): Promise<void> {
  console.log("[web-wrapper] INFO  Starting Web Wrapper...")
  console.log(`[web-wrapper] INFO  Config: port=${config.port}, headless=${config.headless}, adapter=${config.adapterName}`)

  // 先启动 HTTP 服务（确保 health endpoint 始终可访问）
  serve({ config, browser, adapter })

  // 再尝试初始化浏览器
  try {
    await browser.init(config)
    console.log(`[web-wrapper] INFO  Browser ready (headless: ${config.headless})`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[web-wrapper] WARN  Browser initialization failed: ${message}`)
    console.error(`[web-wrapper] WARN  Run "npx playwright install chromium" to install browser binaries`)
    console.error(`[web-wrapper] WARN  Server is running but /v1/chat/completions will fail until fixed`)
  }

  console.log(`[web-wrapper] INFO  Server running on http://localhost:${config.port}`)
  console.log(`[web-wrapper] INFO  Health check: http://localhost:${config.port}/health`)
}

main().catch((err: Error) => {
  console.error(`[web-wrapper] ERROR ${err.message}`)
  if (err.stack) {
    console.error(`[web-wrapper] ERROR ${err.stack}`)
  }
  process.exit(1)
})
