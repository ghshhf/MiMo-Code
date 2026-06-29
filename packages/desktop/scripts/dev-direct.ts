// dev-direct.ts - 直接启动 electron 开发模式
// 替代 electron-vite dev，手动处理构建和启动

import { spawn, execSync } from "node:child_process"
import { resolve } from "node:path"
import { existsSync } from "node:fs"

const root = resolve(__dirname, "..")
const electron = resolve(root, "..", "..", "node_modules", ".bun", "electron@42.5.1", "node_modules", "electron", "dist", "electron.exe")

// 构建主进程和 preload
console.log("[dev-direct] building main + preload...")
execSync("npx electron-vite build", { cwd: root, stdio: "inherit" })

// 启动 vite dev server for renderer
console.log("[dev-direct] starting renderer dev server...")
const viteDevServer = spawn("npx", ["vite", "dev", "--port", "5173"], {
  cwd: resolve(root, "src", "renderer"),
  stdio: "pipe",
  shell: true,
})

viteDevServer.stdout.on("data", (data) => {
  const text = data.toString()
  console.log("[vite]", text.trim())
  if (text.includes("Local:")) {
    // vite server ready, launch electron
    const mainEntry = resolve(root, "out", "main", "index.cjs")
    if (!existsSync(mainEntry)) {
      console.error("[dev-direct] entry not found:", mainEntry)
      return
    }
    console.log("[dev-direct] launching electron...")
    const electronProc = spawn(electron, [mainEntry], {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        VITE_DEV_SERVER_URL: "http://localhost:5173",
        NODE_ENV: "development",
      },
    })
    electronProc.on("close", () => {
      console.log("[dev-direct] electron closed")
      viteDevServer.kill()
      process.exit(0)
    })
  }
})

viteDevServer.stderr.on("data", (data) => {
  console.error("[vite:err]", data.toString().trim())
})
