/**
 * 应用配置系统
 * 通过环境变量加载配置，提供合理的默认值
 */

export interface AppConfig {
  /** 服务端口，默认 3456 */
  port: number
  /** 是否无头模式，默认 true */
  headless: boolean
  /** 请求超时时间（毫秒），默认 300000（5 分钟） */
  requestTimeout: number
  /** session 持久化目录，默认 ./sessions */
  sessionDir: string
  /** 使用的适配器名称，默认 deepseek */
  adapterName: string
  /** 允许的跨域来源，默认 ["*"] */
  allowedOrigins: string[]
}

/**
 * 从环境变量加载配置
 */
export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.WEB_WRAPPER_PORT || "3456", 10),
    headless: process.env.WEB_WRAPPER_HEADLESS !== "false",
    requestTimeout: parseInt(process.env.WEB_WRAPPER_TIMEOUT || "300000", 10),
    sessionDir: process.env.WEB_WRAPPER_SESSION_DIR || "./sessions",
    adapterName: process.env.WEB_WRAPPER_ADAPTER || "deepseek",
    allowedOrigins: (process.env.WEB_WRAPPER_ORIGINS || "*").split(","),
  }
}
