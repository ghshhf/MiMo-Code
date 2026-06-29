#!/bin/bash
# 手动启动 electron 开发模式
set -e

cd "$(dirname "$0")/.."

# 构建 main + preload
echo "==> Building main + preload..."
npx electron-vite build

# 启动 vite renderer dev server
echo "==> Starting renderer dev server..."
npx vite --port 5173 --root src/renderer &
VITE_PID=$!

# 等待 vite server 就绪
sleep 5

# 输出 vite 进程信息
echo "==> Vite dev server PID: $VITE_PID"

# 启动 electron
echo "==> Launching electron..."
ELECTRON_PATH="../../node_modules/.bun/electron@42.5.1/node_modules/electron/dist/electron.exe"

if [ -f "$ELECTRON_PATH" ]; then
    "$ELECTRON_PATH" out/main/index.js &
    ELECTRON_PID=$!
    echo "==> Electron PID: $ELECTRON_PID"
    
    # 等待 electron 关闭
    wait $ELECTRON_PID 2>/dev/null
else
    echo "==> Electron not found at $ELECTRON_PATH, trying via npx..."
    npx electron out/main/index.js
fi

# 清理
kill $VITE_PID 2>/dev/null
echo "==> Done"
