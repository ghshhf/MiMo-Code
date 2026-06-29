import { defineConfig } from "electron-vite"
import appPlugin from "@mimo-ai/app/vite"
import * as fs from "node:fs/promises"
import * as path from "node:path"

const channel = (() => {
  const raw = process.env.OPENCODE_CHANNEL
  if (raw === "dev" || raw === "beta" || raw === "prod") return raw
  return "dev"
})()

const OPENCODE_SERVER_DIST = "../opencode/dist/node"

const nodePtyPkg = `@lydell/node-pty-${process.platform}-${process.arch}`

export default defineConfig({
  main: {
    define: {
      "import.meta.env.OPENCODE_CHANNEL": JSON.stringify(channel),
    },
    build: {
      rollupOptions: {
        input: { index: "src/main/index.ts" },
        external: [
          "electron",
          /opencode\/dist\/node\/node\.js/,
          /opencode\/dist\/.*/,
        ],
        output: {
          format: "cjs",
          entryFileNames: "[name].js",
        },
      },
      externalizeDeps: { include: [nodePtyPkg] },
    },
    plugins: [
      {
        name: "opencode:node-pty-narrower",
        enforce: "pre",
        resolveId(s) {
          if (s === "@lydell/node-pty") return nodePtyPkg
        },
      },
      {
        name: "opencode:virtual-server-module",
        enforce: "pre",
        resolveId(id) {
          if (id === "virtual:opencode-server") return this.resolve(`${OPENCODE_SERVER_DIST}/node.js`)
        },
      },
      {
        name: "opencode:copy-server-assets",
        async writeBundle() {
          const srcDir = path.resolve(__dirname, OPENCODE_SERVER_DIST)
          const destDir = path.resolve(__dirname, "out", "main", "chunks")
          await fs.mkdir(destDir, { recursive: true }).catch(() => {})
          for (const l of await fs.readdir(srcDir)) {
            if (!l.endsWith(".wasm")) continue
            const src = path.join(srcDir, l)
            const dest = path.join(destDir, l)
            console.log(`[copy-server-assets] ${src} -> ${dest}`)
            await fs.writeFile(dest, await fs.readFile(src))
          }
          // 添加 CJS package.json 以确保 out/main/ 被当作 CJS
          await fs.writeFile(
            path.resolve(__dirname, "out", "main", "package.json"),
            JSON.stringify({ type: "commonjs" }, null, 2)
          )
        },
      },
    ],
  },
  preload: {
    build: {
      rollupOptions: {
        input: { index: "src/preload/index.ts" },
        output: {
          format: "cjs",
          entryFileNames: "[name].js",
        },
      },
    },
  },
  renderer: {
    plugins: [appPlugin],
    publicDir: "../../../app/public",
    root: "src/renderer",
    define: {
      "import.meta.env.VITE_OPENCODE_CHANNEL": JSON.stringify(channel),
    },
    build: {
      rollupOptions: {
        input: {
          main: "src/renderer/index.html",
          loading: "src/renderer/loading.html",
        },
      },
    },
  },
})
