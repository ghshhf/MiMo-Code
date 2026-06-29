# MiMo Code Desktop - 功能特性文档

> **版本**: 0.2.0 (重构版)  
> **更新时间**: 2024-01-30  
> **技术栈**: Electron 41.2.1 + SolidJS 1.8.22 + TypeScript 5.7

---

## 📋 目录

- [概述](#概述)
- [核心功能](#核心功能)
- [界面布局](#界面布局)
- [快捷键](#快捷键)
- [技术架构](#技术架构)
- [开发指南](#开发指南)

---

## 概述

MiMo Code Desktop 是基于 MiMo-Code 重构的桌面版 AI 编程助手。保留了原版的核心 Agent 引擎和 MCP 协议支持，同时提供了全新的现代化用户界面。

### 核心优势

- 🚀 **现代化 UI**: 基于 SolidJS 的响应式界面，流畅的动画和过渡效果
- 🧠 **智能记忆**: AI 会记住你的偏好、项目上下文和历史对话
- 🤖 **Agent 可视化**: 实时查看 AI 执行流程，了解其思考和解决问题的过程
- 📁 **项目管理**: 集成文件浏览器，快速定位和管理代码文件
- ⚙️ **丰富设置**: 支持主题、语言、模型参数等深度自定义
- 🎹 **键盘优先**: 完整的快捷键支持，提升操作效率

---

## 核心功能

### 1. 💬 智能对话面板 (ChatPanel)

**文件路径**: `packages/desktop/src/renderer/components/chat/ChatPanel.tsx`

#### 功能特性

- ✅ **消息列表展示**
  - 用户消息（右侧蓝色气泡）
  - AI 消息（左侧灰色气泡）
  - 支持代码块高亮显示
  - 消息元信息（角色、时间戳）

- ✅ **实时消息发送**
  - 输入框支持多行文本（Shift+Enter 换行）
  - Enter 键快速发送
  - 输入框工具栏（文件上传、语音输入）

- ✅ **消息操作**
  - 复制消息内容
  - 应用代码建议
  - 重新生成回复

- ✅ **打字指示器**
  - 流畅的动画效果
  - 实时显示 AI 思考状态

- ✅ **多会话管理**
  - 新建对话
  - 切换对话
  - 删除对话

#### 使用示例

```
用户: 帮我写一个 TypeScript 的类型守卫函数
AI: 好的，下面是一个通用的类型守卫函数示例：

\`\`\`typescript
function isType<T>(
  value: unknown,
  check: (v: unknown) => boolean
): value is T {
  return check(value)
}
\`\`\`

使用示例：
\`\`\`typescript
const isString = isType<string>(
  value,
  (v) => typeof v === "string"
)
\`\`\`
```

---

### 2. 🤖 Agent 可视化面板 (AgentPanel)

**文件路径**: `packages/desktop/src/renderer/components/agent/AgentPanel.tsx`

#### 功能特性

- ✅ **Agent 卡片展示**
  - 三种 Agent 类型（build / plan / compose）
  - Agent 状态显示（idle / running / completed / error）
  - Agent 元信息（创建时间、执行时长）

- ✅ **执行进度可视化**
  - 进度条动画
  - 实时状态更新
  - 执行步骤列表

- ✅ **步骤详情**
  - 步骤标题和描述
  - 步骤状态（pending / running / completed / error）
  - 步骤执行时长

- ✅ **控制操作**
  - 启动 Agent
  - 停止 Agent
  - 查看执行日志

#### Agent 类型说明

| 类型 | 用途 | 示例 |
|------|------|------|
| **build** | 构建和开发任务 | 创建新功能、修复 Bug、重构代码 |
| **plan** | 规划和设计方案 | 架构设计、技术选型、需求分析 |
| **compose** | 写作和文档任务 | 写文档、生成报告、总结内容 |

---

### 3. 🧠 记忆系统面板 (MemoryPanel)

**文件路径**: `packages/desktop/src/renderer/components/memory/MemoryPanel.tsx`

#### 功能特性

- ✅ **记忆类型**
  - **用户记忆**: 用户的偏好、习惯、个人特点
  - **项目记忆**: 项目结构、技术栈、架构决策
  - **偏好记忆**: 代码风格、工具选择、工作流程

- ✅ **记忆管理**
  - 添加新记忆
  - 编辑现有记忆
  - 删除记忆
  - 记忆搜索和过滤

- ✅ **标签系统**
  - 为记忆添加标签
  - 按标签过滤记忆
  - 标签云展示

- ✅ **记忆元信息**
  - 创建时间
  - 更新时间
  - 使用次数

#### 记忆示例

```json
{
  "id": "1",
  "type": "user",
  "title": "用户偏好",
  "content": "用户喜欢简洁的界面设计，倾向于使用快捷键操作",
  "tags": ["偏好", "UI"],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

---

### 4. 📁 项目管理面板 (ProjectPanel)

**文件路径**: `packages/desktop/src/renderer/components/project/ProjectPanel.tsx`

#### 功能特性

- ✅ **文件树浏览**
  - 展开/折叠目录
  - 文件图标识别（根据扩展名）
  - 文件大小显示
  - 最后修改时间

- ✅ **文件操作**
  - 新建文件
  - 新建文件夹
  - 重命名文件
  - 删除文件

- ✅ **文件搜索**
  - 按文件名搜索
  - 按文件内容搜索（未来功能）
  - 搜索结果高亮

- ✅ **项目信息展示**
  - 项目名称
  - 项目路径
  - 项目统计（文件数、代码行数）

#### 支持的文件类型

| 文件类型 | 图标 | 说明 |
|----------|------|------|
| TypeScript (.ts, .tsx) | 📄 | TypeScript 源码 |
| JavaScript (.js, .jsx) | 📄 | JavaScript 源码 |
| CSS (.css) | 🎨 | 样式文件 |
| JSON (.json) | 📋 | 配置文件 |
| Markdown (.md) | 📝 | 文档文件 |
| 图片 (.png, .jpg) | 🖼️ | 图片文件 |

---

### 5. ⚙️ 设置面板 (SettingsPanel)

**文件路径**: `packages/desktop/src/renderer/components/settings/SettingsPanel.tsx`

#### 功能分类

##### 基础设置

- **主题**: 浅色 / 深色 / 跟随系统
- **语言**: 简体中文 / English / 日本語
- **字体大小**: 12px - 20px（滑块调节）
- **自动保存**: 开启 / 关闭

##### 模型设置

- **默认模型**: GPT-4 / GPT-3.5 / Claude 3 / Gemini
- **温度**: 0 - 2（控制输出随机性）
- **最大 Token**: 256 - 8192
- **流式输出**: 开启 / 关闭

##### 界面设置

- **显示行号**: 开启 / 关闭
- **自动换行**: 开启 / 关闭
- **小地图**: 开启 / 关闭
- **自动补全**: 开启 / 关闭

##### 高级设置

- **启用遥测**: 允许收集匿名使用数据
- **自动更新**: 自动检查并安装更新
- **代理服务器**: 配置 HTTP 代理
- **清除数据**: 删除所有对话、记忆和设置

##### 导入/导出

- **导出设置**: 将当前设置保存为 JSON 文件
- **导入设置**: 从 JSON 文件导入设置
- **重置设置**: 恢复为默认设置

#### 设置示例

```json
{
  "theme": "dark",
  "language": "zh-CN",
  "fontSize": 14,
  "autoSave": true,
  "defaultModel": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 4096,
  "streamOutput": true,
  "showLineNumbers": true,
  "wordWrap": true,
  "minimap": false,
  "autoComplete": true,
  "enableTelemetry": false,
  "autoUpdate": true,
  "proxyUrl": ""
}
```

---

### 6. 🎉 欢迎页面 (WelcomePanel)

**文件路径**: `packages/desktop/src/renderer/components/welcome/WelcomePanel.tsx`

#### 功能特性

- ✅ **Hero 区域**
  - 应用 Logo 和名称
  - 简短的功能介绍
  - "开始使用" 按钮

- ✅ **核心特性展示**
  - 5 个核心特性卡片
  - 图标、标题、描述

- ✅ **快捷键列表**
  - 常用快捷键展示
  - 按键和动作对应

- ✅ **快速开始指南**
  - 4 步引导用户快速上手
  - 每一步的详细说明

#### 展示的特性

1. 💬 **智能对话**: 与 AI 进行自然语言对话
2. 🤖 **Agent 可视化**: 实时查看 Agent 执行流程
3. 🧠 **记忆系统**: AI 会记住你的偏好和历史
4. 📁 **项目管理**: 浏览项目文件结构
5. ⚙️ **丰富设置**: 自定义主题、语言、模型参数

---

## 界面布局

### 整体布局

```
┌─────────────────────────────────────────────────────┐
│                   顶部（无）                        │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│          │                                          │
│  侧边栏  │           主内容区                        │
│  (Sidebar)│      (Main Content)                    │
│          │                                          │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
│                 底部状态栏                            │
└─────────────────────────────────────────────────────┘
```

### 侧边栏导航

包含以下按钮：

1. 💬 **对话** (Ctrl+1)
2. 🤖 **Agent** (Ctrl+2)
3. 📁 **项目** (Ctrl+3)
4. 📝 **记忆** (Ctrl+4)
5. ⚙️ **设置** (Ctrl+5)

### 面板切换

- 点击侧边栏按钮切换面板
- 使用键盘快捷键快速切换
- 面板状态会保存在 localStorage 中

---

## 快捷键

### 面板切换

| 快捷键 | 动作 |
|--------|------|
| `Ctrl+1` | 切换到对话面板 |
| `Ctrl+2` | 切换到 Agent 面板 |
| `Ctrl+3` | 切换到项目面板 |
| `Ctrl+4` | 切换到记忆面板 |
| `Ctrl+5` | 切换到设置面板 |

### 界面操作

| 快捷键 | 动作 |
|--------|------|
| `Ctrl+B` | 折叠/展开侧边栏 |
| `Ctrl+Shift+D` | 切换新旧布局 |
| `Esc` | 关闭模态框 / 取消操作 |

### 对话操作

| 快捷键 | 动作 |
|--------|------|
| `Enter` | 发送消息 |
| `Shift+Enter` | 换行 |
| `Ctrl+N` | 新建对话 |
| `Ctrl+/` | 聚焦输入框 |

---

## 技术架构

### 前端技术栈

- **框架**: SolidJS 1.8.22
- **语言**: TypeScript 5.7
- **样式**: CSS Variables + CSS Modules
- **构建**: Vite 5.4

### 后端技术栈

- **运行时**: Electron 41.2.1
- **Agent 引擎**: 基于 MiMo-Code 的核心逻辑
- **MCP 支持**: Model Context Protocol

### 项目结构

```
packages/desktop/
├── src/
│   ├── main/               # Electron 主进程
│   │   ├── index.ts        # 主进程入口
│   │   ├── menu.ts        # 菜单配置
│   │   └── updater.ts    # 自动更新
│   └── renderer/          # 渲染进程（UI）
│       ├── index.tsx       # 渲染进程入口
│       ├── components/     # 组件目录
│       │   ├── layout/    # 布局组件
│       │   ├── sidebar/   # 侧边栏
│       │   ├── chat/      # 对话面板
│       │   ├── agent/     # Agent 面板
│       │   ├── memory/    # 记忆面板
│       │   ├── project/   # 项目面板
│       │   ├── settings/  # 设置面板
│       │   └── welcome/   # 欢迎页面
│       └── styles/        # 样式文件
```

---

## 开发指南

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/ghshhf/MiMo-Code.git
cd MiMo-Code

# 安装 Bun（Windows）
# 从 https://bun.sh 下载安装

# 安装依赖
bun install
```

### 运行开发模式

```bash
# 运行桌面版
bun run dev:desktop

# 运行 Web 版
bun run dev:web
```

### 构建打包

```bash
# 打包桌面版
bun run build:desktop

# 打包所有平台
bun run package
```

### 代码规范

- **ESLint**: 使用 `@codebuddy/eslint-config` 规范
- **Prettier**: 使用项目根目录的 `.prettierrc`
- **Git 提交**: 使用 Conventional Commits 规范

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 未来计划

### Phase 4: 高级功能

- [ ] 实时协作（多用户同时编辑）
- [ ] 插件市场（扩展功能）
- [ ] 主题商店（更多主题）
- [ ] 高级搜索（全文搜索、正则表达式）

### Phase 5: 性能优化

- [ ] 虚拟滚动（大文件列表）
- [ ] 懒加载（组件按需加载）
- [ ] 缓存优化（减少重复请求）
- [ ] Web Worker（耗时任务分离）

### Phase 6: 生态建设

- [ ] VS Code 插件版本
- [ ] JetBrains IDE 插件版本
- [ ] 命令行工具版本
- [ ] 移动端配套 App

---

## 许可证

本项目采用 **MIT License** 开源。

**原项目**: [MiMo-Code](https://github.com/XiaomiMiMo/MiMo-Code)  
**Fork 仓库**: [ghshhf/MiMo-Code](https://github.com/ghshhf/MiMo-Code)

---

## 联系方式

- **Issues**: [GitHub Issues](https://github.com/ghshhf/MiMo-Code/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ghshhf/MiMo-Code/discussions)

---

**🎉 感谢使用 MiMo Code Desktop！**

如有问题或建议，欢迎提交 Issue 或加入讨论！
