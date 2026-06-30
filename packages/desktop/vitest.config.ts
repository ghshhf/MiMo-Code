import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["src/main/**", "src/**/html.test.*", "node_modules"],
    testTimeout: 15000,
    server: {
      deps: {
        inline: ["solid-js", "@solidjs/testing-library"],
      },
    },
  },
  resolve: {
    conditions: ["browser", "development", "import", "module"],
  },
})
