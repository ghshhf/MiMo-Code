/**
 * DeepSeek Web 适配器
 * 通过 Playwright 操作 DeepSeek Chat 网页，发送消息并获取回复
 *
 * 注意：页面选择器（CSS selectors）需要根据 DeepSeek 实际页面结构调整。
 * 如果页面更新导致选择器失效，请手动更新下方 SELECTORS 常量。
 */
import type { Page } from "@playwright/test"
import type { WebAdapter } from "../adapter"
import type { PageSelectors, SendMessageOptions } from "../types"

/**
 * DeepSeek Chat 页面元素选择器
 *
 * 常见选择器说明：
 * - textarea: 文本输入框
 * - button[type='submit']: 发送按钮
 * - .ds-markdown / .prose: 回复内容区域
 * - .thinking-content / .reasoning: 思考/推理内容区域
 * - button:has-text('停止'): 停止生成按钮
 *
 * 这些选择器基于 DeepSeek 常见页面结构设定，如果页面改版需要更新。
 */
const SELECTORS: PageSelectors = {
  textarea: "textarea",
  submitButton: "button[type='submit']",
  responseArea: ".ds-markdown, .prose",
  thinkingArea: ".thinking-content, .reasoning",
  stopButton: "button:has-text('停止')",
}

export class DeepSeekWebAdapter implements WebAdapter {
  readonly id = "deepseek"
  readonly name = "DeepSeek Web"
  readonly url = "https://chat.deepseek.com/"

  getSelectors(): PageSelectors {
    return SELECTORS
  }

  async *sendMessage(page: Page, text: string, options?: SendMessageOptions): AsyncIterable<string> {
    const sel = this.getSelectors()

    // 等待输入框可用
    await page.waitForSelector(sel.textarea, { timeout: 10000 })

    // 清空输入框并输入新消息
    await page.locator(sel.textarea).fill("")
    await page.locator(sel.textarea).fill(text)

    // 点击发送按钮
    await page.locator(sel.submitButton).click()

    if (options?.stream) {
      // 流式模式：轮询提取增量文本
      yield* this.streamResponse(page, sel, options.timeout || 300000)
    } else {
      // 非流式模式：等待完整回复
      yield* this.waitForCompleteResponse(page, sel)
    }
  }

  /**
   * 流式模式实现：通过轮询页面元素获取增量内容
   */
  private async *streamResponse(
    page: Page,
    sel: PageSelectors,
    timeout: number,
  ): AsyncGenerator<string, void, unknown> {
    let lastContent = ""
    let lastReasoning = ""
    const startTime = Date.now()
    const reasoningSel = sel.thinkingArea

    while (Date.now() - startTime < timeout) {
      await page.waitForTimeout(300) // 300ms 轮询间隔

      // 提取思考/推理内容
      if (reasoningSel) {
        try {
          const reasoningEl = await page.$(reasoningSel)
          if (reasoningEl) {
            const newReasoning = (await reasoningEl.textContent()) || ""
            if (newReasoning.length > lastReasoning.length) {
              const delta = newReasoning.slice(lastReasoning.length)
              lastReasoning = newReasoning
              yield JSON.stringify({ type: "reasoning", content: delta })
            }
          }
        } catch {
          // 元素可能还未出现，忽略
        }
      }

      // 提取回复内容
      try {
        const responseEl = await page.$(sel.responseArea)
        if (responseEl) {
          const newContent = (await responseEl.textContent()) || ""
          if (newContent.length > lastContent.length) {
            const delta = newContent.slice(lastContent.length)
            lastContent = newContent
            yield JSON.stringify({ type: "content", content: delta })
          }
        }
      } catch {
        // 元素可能还未出现，忽略
      }

      // 检查是否已停止生成（停止按钮消失 = 回复完成）
      if (sel.stopButton) {
        const stopBtn = await page.$(sel.stopButton)
        if (!stopBtn && lastContent.length > 0) {
          console.log("[web-wrapper] DEBUG  Stream complete (stop button disappeared)")
          break
        }
      }
    }

    // 剩余思考内容（如果有）
    if (reasoningSel && lastReasoning.length > 0) {
      try {
        const reasoningEl = await page.$(reasoningSel)
        if (reasoningEl) {
          const finalReasoning = (await reasoningEl.textContent()) || ""
          if (finalReasoning.length > lastReasoning.length) {
            const delta = finalReasoning.slice(lastReasoning.length)
            yield JSON.stringify({ type: "reasoning", content: delta })
          }
        }
      } catch {
        // 忽略
      }
    }
  }

  /**
   * 非流式模式实现：等待完整回复内容
   */
  private async *waitForCompleteResponse(
    page: Page,
    sel: PageSelectors,
  ): AsyncGenerator<string, void, unknown> {
    // 等待回复区域出现
    await page.waitForSelector(sel.responseArea, { timeout: 30000 })

    // 等待回复完成（停止按钮消失 = 生成结束）
    if (sel.stopButton) {
      try {
        await page.waitForFunction(
          (selector: string) => !document.querySelector(selector),
          sel.stopButton,
          { timeout: 300000, polling: 500 },
        )
      } catch {
        // 超时也接受已有内容
        console.log("[web-wrapper] WARN  Response polling timed out, using partial content")
      }
    }

    // 获取完整回复内容
    const responseText = await page.locator(sel.responseArea).textContent()

    // 获取思考内容（如果存在）
    let reasoningText: string | undefined
    if (sel.thinkingArea) {
      reasoningText = (await page
        .locator(sel.thinkingArea)
        .textContent()
        .catch(() => "")) ?? undefined
    }

    yield JSON.stringify({
      type: "complete",
      content: responseText || "",
      reasoning: reasoningText || undefined,
    })
  }
}
