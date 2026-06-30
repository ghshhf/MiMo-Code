// SettingsPanel.tsx - 使用全局状态的设置面板

import { createSignal, Show } from "solid-js"
import { useAppStore } from "../../stores/AppStore"

export function SettingsPanel() {
  const store = useAppStore()
  const [showResetConfirm, setShowResetConfirm] = createSignal(false)

  // 更新状态
  const [updateStatus, setUpdateStatus] = createSignal<{
    checking: boolean
    available: boolean
    version?: string
    downloading: boolean
    ready: boolean
    error?: string
  }>({ checking: false, available: false, downloading: false, ready: false })

  const checkForUpdates = async () => {
    setUpdateStatus({ checking: true, available: false, downloading: false, ready: false })
    try {
      if (typeof window.api?.checkUpdate === "function") {
        const result = await window.api.checkUpdate()
        if (result?.updateAvailable) {
          setUpdateStatus({
            checking: false,
            available: true,
            version: result.version,
            downloading: true,
            ready: false,
          })
          // 自动开始下载
          await window.api.runUpdater?.(false)
          setUpdateStatus({
            checking: false,
            available: true,
            version: result.version,
            downloading: false,
            ready: true,
          })
        } else {
          setUpdateStatus({
            checking: false,
            available: false,
            ready: false,
            downloading: false,
            error: result?.failed ? "检查更新失败" : "已是最新版本",
          })
        }
      } else {
        // 开发模式下模拟
        await new Promise(r => setTimeout(r, 1000))
        setUpdateStatus({
          checking: false,
          available: true,
          version: "1.0.0",
          downloading: false,
          ready: true,
        })
      }
    } catch (err: any) {
      setUpdateStatus({
        checking: false,
        available: false,
        downloading: false,
        ready: false,
        error: err?.message || "检查更新失败",
      })
    }
  }

  const installUpdate = async () => {
    try {
      if (typeof window.api?.installUpdate === "function") {
        await window.api.installUpdate()
      }
    } catch {}
  }
  const s = () => store.settings

  return (
    <div class="settings-panel">
      <div class="settings-header">
        <h2>⚙️ 设置</h2>
        <div class="settings-actions">
          <button class="action-btn" onClick={() => {
            const blob = new Blob([JSON.stringify(s(), null, 2)], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url; a.download = "settings.json"; a.click()
          }}>📤 导出</button>
          <button class="action-btn danger" onClick={() => setShowResetConfirm(true)}>🔄 重置</button>
        </div>
      </div>

      <div class="settings-content">
        {/* 基础设置 */}
        <section class="settings-section">
          <h3>基础设置</h3>
          <div class="setting-row">
            <label>主题</label>
            <select value={s().theme} onChange={(e) => store.updateSettings({ theme: e.currentTarget.value as any })}>
              <option value="dark">深色</option>
              <option value="light">浅色</option>
              <option value="auto">跟随系统</option>
            </select>
          </div>
          <div class="setting-row">
            <label>语言</label>
            <select value={s().language} onChange={(e) => store.updateSettings({ language: e.currentTarget.value as any })}>
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
          <div class="setting-row">
            <label>字体大小</label>
            <input type="range" min="10" max="24" value={s().fontSize}
              onInput={(e) => store.updateSettings({ fontSize: parseInt(e.currentTarget.value) })} />
            <span class="setting-value">{s().fontSize}px</span>
          </div>
          <div class="setting-row">
            <label>自动保存</label>
            <input type="checkbox" checked={s().autoSave}
              onChange={(e) => store.updateSettings({ autoSave: e.currentTarget.checked })} />
          </div>
        </section>

        {/* 模型设置 */}
        <section class="settings-section">
          <h3>模型设置</h3>
          <div class="setting-row">
            <label>默认模型</label>
            <select value={s().defaultModel} onChange={(e) => store.updateSettings({ defaultModel: e.currentTarget.value })}>
              <option value="miMo-v2.5">MiMo v2.5</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="claude-3.5">Claude 3.5 Sonnet</option>
            </select>
          </div>
          <div class="setting-row">
            <label>温度</label>
            <input type="range" min="0" max="2" step="0.1" value={s().temperature}
              onInput={(e) => store.updateSettings({ temperature: parseFloat(e.currentTarget.value) })} />
            <span class="setting-value">{s().temperature}</span>
          </div>
          <div class="setting-row">
            <label>最大 Token</label>
            <input type="range" min="1024" max="32768" step="1024" value={s().maxTokens}
              onInput={(e) => store.updateSettings({ maxTokens: parseInt(e.currentTarget.value) })} />
            <span class="setting-value">{s().maxTokens}</span>
          </div>
          <div class="setting-row">
            <label>流式输出</label>
            <input type="checkbox" checked={s().streamOutput}
              onChange={(e) => store.updateSettings({ streamOutput: e.currentTarget.checked })} />
          </div>
        </section>

        {/* 界面设置 */}
        <section class="settings-section">
          <h3>界面设置</h3>
          <div class="setting-row">
            <label>显示行号</label>
            <input type="checkbox" checked={s().showLineNumbers}
              onChange={(e) => store.updateSettings({ showLineNumbers: e.currentTarget.checked })} />
          </div>
          <div class="setting-row">
            <label>自动换行</label>
            <input type="checkbox" checked={s().wordWrap}
              onChange={(e) => store.updateSettings({ wordWrap: e.currentTarget.checked })} />
          </div>
        </section>

        {/* 更新管理 */}
        <section class="settings-section">
          <h3>📦 更新管理</h3>
          <div class="update-section">
            <Show when={!updateStatus().checking && !updateStatus().available && !updateStatus().error}>
              <div class="update-info">
                <p>当前版本: 0.1.4 (desktop-redesign)</p>
                <button class="action-btn" onClick={checkForUpdates}>
                  🔄 检查更新
                </button>
              </div>
            </Show>

            <Show when={updateStatus().checking}>
              <div class="update-info checking">
                <div class="spinner-small" />
                <p>正在检查更新...</p>
              </div>
            </Show>

            <Show when={updateStatus().error && !updateStatus().checking}>
              <div class="update-info result">
                <p class="update-error">{updateStatus().error}</p>
                <button class="action-btn" onClick={checkForUpdates}>
                  🔄 重新检查
                </button>
              </div>
            </Show>

            <Show when={updateStatus().ready}>
              <div class="update-info ready">
                <p>✅ 更新已就绪: v{updateStatus().version}</p>
                <button class="btn-primary" onClick={installUpdate}>
                  🚀 立即重启安装
                </button>
              </div>
            </Show>
          </div>
        </section>

        {/* 关于 */}
        <section class="settings-section">
          <h3>关于</h3>
          <div class="about-info">
            <p><strong>MiMo Desktop</strong></p>
            <p>版本: 0.1.4 (桌面版重设计)</p>
            <p>技术栈: Electron + SolidJS + Bun</p>
            <p>基于 MiMo-Code 开源项目构建</p>
          </div>
        </section>
      </div>

      {/* 重置确认对话框 */}
      <Show when={showResetConfirm()}>
        <div class="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div class="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>确认重置</h3>
            <p>所有设置将恢复为默认值，此操作不可撤销。</p>
            <div class="modal-actions">
              <button class="action-btn" onClick={() => setShowResetConfirm(false)}>取消</button>
              <button class="action-btn danger" onClick={() => {
                store.resetSettings()
                setShowResetConfirm(false)
              }}>确认重置</button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}
