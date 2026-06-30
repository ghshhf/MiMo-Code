import type { Page } from "@playwright/test"
import type { PageSelectors, SendMessageOptions } from "./types"

/**
 * WebAdapter 抽象接口
 * 每种 AI Web 页面（DeepSeek、Kimi 等）实现此接口以适配不同的页面结构和交互方式
 */
export interface WebAdapter {
  /** 适配器唯一标识 */
  readonly id: string
  /** 适配器显示名称 */
  readonly name: string
  /** AI 服务的 URL */
  readonly url: string

  /**
   * 向 AI 页面发送消息并获取回复
   * @param page - Playwright Page 实例
   * @param text - 转换后的纯文本消息
   * @param options - 发送选项（流式/非流式）
   * @returns AsyncIterable<string> - 产出 JSON 字符串，包含 type/content 字段
   */
  sendMessage(page: Page, text: string, options?: SendMessageOptions): AsyncIterable<string>

  /** 获取页面元素选择器 */
  getSelectors(): PageSelectors
}
