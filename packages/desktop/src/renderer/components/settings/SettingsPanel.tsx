import { createSignal, Show } from "solid-js"
import "./settings-styles.css"

// 设置类型定义
interface Settings {
  // 基础设置
  theme: "light" | "dark" | "auto"
  language: string
  fontSize: number
  autoSave: boolean

  // 模型设置
  defaultModel: string
  temperature: number
  maxTokens: number
  streamOutput: boolean

  // 界面设置
  showLineNumbers: boolean
  wordWrap: boolean
  minimap: boolean
  autoComplete: boolean

  // 高级设置
  enableTelemetry: boolean
  autoUpdate: boolean
  proxyUrl: string
}

// 默认设置
const defaultSettings: Settings = {
  theme: "dark",
  language: "zh-CN",
  fontSize: 14,
  autoSave: true,
  defaultModel: "gpt-4",
  temperature: 0.7,
  maxTokens: 4096,
  streamOutput: true,
  showLineNumbers: true,
  wordWrap: true,
  minimap: false,
  autoComplete: true,
  enableTelemetry: false,
  autoUpdate: true,
  proxyUrl: ""
}

export function SettingsPanel() {
  const [settings, setSettings] = createSignal<Settings>(defaultSettings)
  const [activeSection, setActiveSection] = createSignal("basic")
  const [hasChanges, setHasChanges] = createSignal(false)
  const [showResetConfirm, setShowResetConfirm] = createSignal(false)

  // 更新设置
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // 保存设置
  const saveSettings = () => {
    // 这里应该保存到配置文件
    localStorage.setItem("app-settings", JSON.stringify(settings()))
    setHasChanges(false)
    showNotification("设置已保存")
  }

  // 重置设置
  const resetSettings = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    setShowResetConfirm(false)
  }

  // 导出设置
  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings(), null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "settings.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导入设置
  const importSettings = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string)
            setSettings(imported)
            setHasChanges(true)
            showNotification("设置已导入")
          } catch {
            showNotification("导入失败：文件格式错误")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div class="settings-panel">
      {/* 头部 */}
      <div class="settings-header">
        <h2>⚙️ 设置</h2>
        <div class="settings-actions">
          <Show when={hasChanges()}>
            <button class="btn-warning" onClick={saveSettings}>
              💾 保存更改
            </button>
          </Show>
          <button class="btn-secondary" onClick={() => setShowResetConfirm(true)}>
            🔄 重置
          </button>
          <button class="btn-secondary" onClick={exportSettings}>
            📤 导出
          </button>
          <button class="btn-secondary" onClick={importSettings}>
            📥 导入
          </button>
        </div>
      </div>

      {/* 主体 */}
      <div class="settings-body">
        {/* 侧边栏 */}
        <div class="settings-sidebar">
          <button
            class={`settings-nav-item ${activeSection() === "basic" ? "active" : ""}`}
            onClick={() => setActiveSection("basic")}
          >
            🎨 基础设置
          </button>
          <button
            class={`settings-nav-item ${activeSection() === "model" ? "active" : ""}`}
            onClick={() => setActiveSection("model")}
          >
            🤖 模型设置
          </button>
          <button
            class={`settings-nav-item ${activeSection() === "interface" ? "active" : ""}`}
            onClick={() => setActiveSection("interface")}
          >
            💻 界面设置
          </button>
          <button
            class={`settings-nav-item ${activeSection() === "advanced" ? "active" : ""}`}
            onClick={() => setActiveSection("advanced")}
          >
            🔧 高级设置
          </button>
          <button
            class={`settings-nav-item ${activeSection() === "about" ? "active" : ""}`}
            onClick={() => setActiveSection("about")}
          >
            ℹ️ 关于
          </button>
        </div>

        {/* 内容区 */}
        <div class="settings-content">
          {/* 基础设置 */}
          <Show when={activeSection() === "basic"}>
            <div class="settings-section">
              <h3>基础设置</h3>

              <div class="setting-item">
                <div class="setting-info">
                  <label>主题</label>
                  <span class="setting-desc">选择界面主题</span>
                </div>
                <select
                  value={settings().theme}
                  onInput={(e) => updateSetting("theme", e.currentTarget.value as Settings["theme"])}
                  class="setting-select"
                >
                  <option value="light">☀️ 浅色</option>
                  <option value="dark">🌙 深色</option>
                  <option value="auto">🔄 跟随系统</option>
                </select>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label>语言</label>
                  <span class="setting-desc">界面显示语言</span>
                </div>
                <select
                  value={settings().language}
                  onInput={(e) => updateSetting("language", e.currentTarget.value)}
                  class="setting-select"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                </select>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label>字体大小</label>
                  <span class="setting-desc">界面字体大小（{settings().fontSize}px）</span>
                </div>
                <div class="setting-control">
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={settings().fontSize}
                    onInput={(e) => updateSetting("fontSize", parseInt(e.currentTarget.value))}
                    class="setting-slider"
                  />
                  <span class="setting-value">{settings().fontSize}px</span>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label>自动保存</label>
                  <span class="setting-desc">自动保存对话和修改</span>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings().autoSave}
                    onInput={(e) => updateSetting("autoSave", e.currentTarget.checked)}
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </Show>

          {/* 模型设置 */}
          <Show when={activeSection() === "model"}>
            <div class="settings-section">
              <h3>模型设置</h3>

              <div class="setting-item">
                <div class="setting-info">
                  <label>默认模型</label>
                  <span class="setting-desc">选择默认使用的 AI 模型</span>
                </div>
                <select
                  value={settings().defaultModel}
                  onInput={(e) => updateSetting("defaultModel", e.currentTarget.value)}
                  class="setting-select"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5">GPT-3.5</option>
                  <option value="claude-3">Claude 3</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label>温度</label>
                  <span class="setting-desc">控制输出的随机性（{settings().temperature}）</span>
                </div>
                <div class="setting-control">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings().temperature}
                    onInput={(e) => updateSetting("temperature", parseFloat(e.currentTarget.value))}
                    class="setting-slider"
                  />
                  <span class="setting-value">{settings().temperature}</span>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label>最大 Token</label>
                  <span class="setting-desc">单次对话最大 token 数</span>
                </div>
                <input
                  type="number"
                  value={settings().maxTokens}
                  onInput={(e) => updateSetting("maxTokens", parseInt(e.currentTarget.value))}
                  class="setting-input"
                  min="256"
                  max="8192"
                  step="256"
                />
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label>流式输出</label>
                  <span class="setting-desc">实时显示 AI 输出</span>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings().streamOutput}
                    onInput={(e) => updateSetting("streamOutput", e.currentTarget.checked)}
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </Show>

          {/* 界面设置 */}
          <Show when={activeSection() === "interface"}>
            <div class="settings-section">
              <h3>界面设置</h3>

              <div class="setting-item">
                <div class="setting-info">
                  <label>显示行号</label>
                  <span class="setting-desc">在代码编辑器中显示行号</span>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings().showLineNumbers}
                    onInput={(e) => updateSetting("showLineNumbers", e.currentTarget.checked)}
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label>自动换行</label>
                  <span class="setting-desc">长行自动换行显示</span>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings().wordWrap}
                    onInput={(e) => updateSetting("wordWrap", e.currentTarget.checked)}
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label>小地图</label>
                  <span class="setting-desc">显示代码小地图</span>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings().minimap}
                    onInput={(e) => updateSetting("minimap", e.currentTarget.checked)}
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label>自动补全</label>
                  <span class="setting-desc">启用代码自动补全</span>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings().autoComplete}
                    onInput={(e) => updateSetting("autoComplete", e.currentTarget.checked)}
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </Show>

          {/* 高级设置 */}
          <Show when={activeSection() === "advanced"}>
            <div class="settings-section">
              <h3>高级设置</h3>

              <div class="setting-item">
                <div class="setting-info">
                  <label>启用遥测</label>
                  <span class="setting-desc">允许收集匿名使用数据以改进产品</span>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings().enableTelemetry}
                    onInput={(e) => updateSetting("enableTelemetry", e.currentTarget.checked)}
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label>自动更新</label>
                  <span class="setting-desc">自动检查并安装更新</span>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings().autoUpdate}
                    onInput={(e) => updateSetting("autoUpdate", e.currentTarget.checked)}
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label>代理服务器</label>
                  <span class="setting-desc">配置 HTTP 代理（可选）</span>
                </div>
                <input
                  type="text"
                  placeholder="http://proxy.example.com:8080"
                  value={settings().proxyUrl}
                  onInput={(e) => updateSetting("proxyUrl", e.currentTarget.value)}
                  class="setting-input"
                />
              </div>

              <div class="setting-item danger-zone">
                <div class="setting-info">
                  <label>清除所有数据</label>
                  <span class="setting-desc">删除所有对话、记忆和设置</span>
                </div>
                <button class="btn-danger" onClick={() => {
                  if (confirm("确定要清除所有数据吗？此操作不可恢复！")) {
                    localStorage.clear()
                    showNotification("所有数据已清除")
                  }
                }}>
                  🗑️ 清除数据
                </button>
              </div>
            </div>
          </Show>

          {/* 关于 */}
          <Show when={activeSection() === "about"}>
            <div class="settings-section about-section">
              <div class="about-logo">🤖</div>
              <h3>MiMo Code Desktop</h3>
              <p class="about-version">版本 0.2.0 (重构版)</p>
              <p class="about-desc">
                基于 MiMo-Code 重构的桌面版 AI 编程助手
              </p>

              <div class="about-links">
                <a href="#" class="about-link">📖 使用文档</a>
                <a href="#" class="about-link">🐛 报告问题</a>
                <a href="#" class="about-link">💡 功能建议</a>
                <a href="#" class="about-link">⭐ GitHub</a>
              </div>

              <div class="about-tech">
                <h4>技术栈</h4>
                <ul>
                  <li>Electron 41.2.1</li>
                  <li>SolidJS 1.8.22</li>
                  <li>TypeScript 5.7</li>
                  <li>TailwindCSS 4.0</li>
                </ul>
              </div>

              <p class="about-copyright">
                © 2024 MiMo Team. All rights reserved.
              </p>
            </div>
          </Show>
        </div>
      </div>

      {/* 重置确认对话框 */}
      <Show when={showResetConfirm()}>
        <div class="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div class="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>🔄 重置设置</h3>
            </div>
            <div class="modal-body">
              <p>确定要将所有设置重置为默认值吗？</p>
              <p class="warning-text">此操作不可撤销！</p>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" onClick={() => setShowResetConfirm(false)}>
                取消
              </button>
              <button class="btn-danger" onClick={resetSettings}>
                确认重置
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

// 显示通知（简单实现）
function showNotification(message: string) {
  const notification = document.createElement("div")
  notification.className = "notification"
  notification.textContent = message
  document.body.appendChild(notification)
  setTimeout(() => {
    notification.classList.add("fade-out")
    setTimeout(() => notification.remove(), 300)
  }, 2000)
}
