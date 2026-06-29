import { createSignal, onCleanup } from "solid-js"

interface WelcomePanelProps {
  onGetStarted: () => void
}

export function WelcomePanel(props: WelcomePanelProps) {
  const [currentStep, setCurrentStep] = createSignal(0)

  const features = [
    {
      icon: "💬",
      title: "智能对话",
      desc: "与 AI 进行自然语言对话，获取代码建议、调试帮助和架构设计。"
    },
    {
      icon: "🤖",
      title: "Agent 可视化",
      desc: "实时查看 Agent 执行流程，了解 AI 如何思考和解决问题。"
    },
    {
      icon: "🧠",
      title: "记忆系统",
      desc: "AI 会记住你的偏好、项目上下文和历史对话，提供个性化体验。"
    },
    {
      icon: "📁",
      title: "项目管理",
      desc: "浏览项目文件结构，快速定位和管理代码文件。"
    },
    {
      icon: "⚙️",
      title: "丰富设置",
      desc: "自定义主题、语言、模型参数等，打造专属开发环境。"
    }
  ]

  const shortcuts = [
    { key: "Ctrl+1", action: "切换到对话面板" },
    { key: "Ctrl+2", action: "切换到 Agent 面板" },
    { key: "Ctrl+3", action: "切换到项目面板" },
    { key: "Ctrl+4", action: "切换到记忆面板" },
    { key: "Ctrl+5", action: "切换到设置面板" },
    { key: "Ctrl+B", action: "折叠/展开侧边栏" },
    { key: "Ctrl+Shift+D", action: "切换新旧布局" },
    { key: "Esc", action: "关闭模态框/取消操作" }
  ]

  return (
    <div class="welcome-panel">
      {/* Hero 区域 */}
      <div class="welcome-hero">
        <div class="welcome-logo">🤖</div>
        <h1 class="welcome-title">欢迎使用 MiMo Code Desktop</h1>
        <p class="welcome-subtitle">
          基于 MiMo-Code 重构的新一代 AI 编程助手
        </p>
        <button class="get-started-btn" onClick={props.onGetStarted}>
          🚀 开始使用
        </button>
      </div>

      {/* 特性展示 */}
      <div class="welcome-features">
        <h2>✨ 核心特性</h2>
        <div class="features-grid">
          {features.map((f) => (
            <div class="feature-card">
              <div class="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 快捷键 */}
      <div class="welcome-shortcuts">
        <h2>⌨️ 键盘快捷键</h2>
        <div class="shortcuts-grid">
          {shortcuts.map((s) => (
            <div class="shortcut-item">
              <kbd class="shortcut-key">{s.key}</kbd>
              <span class="shortcut-action">{s.action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 快速开始 */}
      <div class="welcome-quickstart">
        <h2>🚀 快速开始</h2>
        <div class="quickstart-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>选择模型</h3>
              <p>在设置面板中配置你喜欢的 AI 模型（GPT-4、Claude、Gemini 等）</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>打开项目</h3>
              <p>在项目面板中浏览你的代码文件，或使用对话面板让 AI 帮你分析</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>开始对话</h3>
              <p>在对话面板中输入你的问题，AI 会实时回复并提供代码建议</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>查看 Agent</h3>
              <p>当 AI 执行复杂任务时，在 Agent 面板中查看执行进度和步骤</p>
            </div>
          </div>
        </div>
      </div>

      {/* 底部 */}
      <div class="welcome-footer">
        <p>
          💡 提示：按 <kbd>Ctrl+Shift+D</kbd> 可以在新旧布局之间切换
        </p>
        <p class="welcome-version">
          Version 0.2.0 (重构版) | Built with Electron + SolidJS
        </p>
      </div>
    </div>
  )
}
