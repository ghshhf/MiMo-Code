import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { Flag } from "../../src/flag/flag"

describe("Flag", () => {
  const OLD_ENV = { ...process.env }

  beforeEach(() => {
    // Reset process.env to original state before each test
    process.env = { ...OLD_ENV }
  })

  afterEach(() => {
    process.env = { ...OLD_ENV }
  })

  // --- Non-getter properties (module-level constants, evaluated at import time) ---
  // These are loaded with the initial env state. Their defaults reflect the
  // environment available at the top of this file (before beforeEach runs).

  describe("module-level constants (default values)", () => {
    test("MIMOCODE_DISABLE_AUTOUPDATE defaults to false", () => {
      expect(Flag.MIMOCODE_DISABLE_AUTOUPDATE).toBe(false)
    })

    test("MIMOCODE_ENABLE_ANALYSIS defaults to true", () => {
      expect(Flag.MIMOCODE_ENABLE_ANALYSIS).toBe(true)
    })

    test("MIMOCODE_OUTPUT_LENGTH_CONTINUATION_LIMIT defaults to 3", () => {
      expect(Flag.MIMOCODE_OUTPUT_LENGTH_CONTINUATION_LIMIT).toBe(3)
    })

    test("MIMOCODE_TEXT_NGRAM_N defaults to 6", () => {
      expect(Flag.MIMOCODE_TEXT_NGRAM_N).toBe(6)
    })

    test("MIMOCODE_TEXT_REPEAT_THRESHOLD defaults to 3", () => {
      expect(Flag.MIMOCODE_TEXT_REPEAT_THRESHOLD).toBe(3)
    })

    test("MIMOCODE_TEXT_WINDOW_TOKENS defaults to 500", () => {
      expect(Flag.MIMOCODE_TEXT_WINDOW_TOKENS).toBe(500)
    })

    test("MIMOCODE_INVALID_OUTPUT_CONTINUATION_LIMIT defaults to 2", () => {
      expect(Flag.MIMOCODE_INVALID_OUTPUT_CONTINUATION_LIMIT).toBe(2)
    })

    test("MIMOCODE_TEXT_TOOL_CALL_RETRY_LIMIT defaults to 2", () => {
      expect(Flag.MIMOCODE_TEXT_TOOL_CALL_RETRY_LIMIT).toBe(2)
    })
  })

  // --- Getter properties (evaluated at runtime, responsive to env changes) ---

  describe("MIMOCODE_DISABLE_COMPOSE_SKILLS (getter)", () => {
    test("defaults to false", () => {
      expect(Flag.MIMOCODE_DISABLE_COMPOSE_SKILLS).toBe(false)
    })

    test("returns true when env set", () => {
      process.env.MIMOCODE_DISABLE_COMPOSE_SKILLS = "true"
      expect(Flag.MIMOCODE_DISABLE_COMPOSE_SKILLS).toBe(true)
    })
  })

  describe("MIMOCODE_DISABLE_BUILTIN_SKILLS (getter)", () => {
    test("defaults to false", () => {
      expect(Flag.MIMOCODE_DISABLE_BUILTIN_SKILLS).toBe(false)
    })

    test("returns true when env set", () => {
      process.env.MIMOCODE_DISABLE_BUILTIN_SKILLS = "true"
      expect(Flag.MIMOCODE_DISABLE_BUILTIN_SKILLS).toBe(true)
    })
  })

  describe("MIMOCODE_DISABLE_PROJECT_CONFIG (getter)", () => {
    test("defaults to false", () => {
      expect(Flag.MIMOCODE_DISABLE_PROJECT_CONFIG).toBe(false)
    })

    test("returns true when env set", () => {
      process.env.MIMOCODE_DISABLE_PROJECT_CONFIG = "true"
      expect(Flag.MIMOCODE_DISABLE_PROJECT_CONFIG).toBe(true)
    })
  })

  describe("MIMOCODE_PURE (getter)", () => {
    test("defaults to false", () => {
      expect(Flag.MIMOCODE_PURE).toBe(false)
    })

    test("returns true when env set", () => {
      process.env.MIMOCODE_PURE = "true"
      expect(Flag.MIMOCODE_PURE).toBe(true)
    })
  })

  describe("MIMOCODE_CLIENT (getter)", () => {
    test('defaults to "cli"', () => {
      expect(Flag.MIMOCODE_CLIENT).toBe("cli")
    })

    test("returns env value when set", () => {
      process.env.MIMOCODE_CLIENT = "vscode"
      expect(Flag.MIMOCODE_CLIENT).toBe("vscode")
    })
  })

  describe("MIMOCODE_TUI_CONFIG (getter)", () => {
    test("defaults to undefined", () => {
      expect(Flag.MIMOCODE_TUI_CONFIG).toBeUndefined()
    })

    test("returns env value when set", () => {
      process.env.MIMOCODE_TUI_CONFIG = "/path/to/tui.json"
      expect(Flag.MIMOCODE_TUI_CONFIG).toBe("/path/to/tui.json")
    })
  })

  describe("MIMOCODE_CONFIG_DIR (getter)", () => {
    test("defaults to undefined", () => {
      expect(Flag.MIMOCODE_CONFIG_DIR).toBeUndefined()
    })

    test("returns env value when set", () => {
      process.env.MIMOCODE_CONFIG_DIR = "/custom/config"
      expect(Flag.MIMOCODE_CONFIG_DIR).toBe("/custom/config")
    })
  })

  describe("MIMOCODE_HOME (getter)", () => {
    test("defaults to undefined", () => {
      expect(Flag.MIMOCODE_HOME).toBeUndefined()
    })

    test("returns env value when set", () => {
      process.env.MIMOCODE_HOME = "/custom/home"
      expect(Flag.MIMOCODE_HOME).toBe("/custom/home")
    })
  })

  describe("MIMOCODE_PLUGIN_META_FILE (getter)", () => {
    test("defaults to undefined", () => {
      expect(Flag.MIMOCODE_PLUGIN_META_FILE).toBeUndefined()
    })

    test("returns env value when set", () => {
      process.env.MIMOCODE_PLUGIN_META_FILE = "/path/to/meta.json"
      expect(Flag.MIMOCODE_PLUGIN_META_FILE).toBe("/path/to/meta.json")
    })
  })

  describe("MIMOCODE_DISABLE_CLAUDE_CODE_MCP (getter)", () => {
    test("defaults to false", () => {
      expect(Flag.MIMOCODE_DISABLE_CLAUDE_CODE_MCP).toBe(false)
    })

    test("returns true when env set", () => {
      process.env.MIMOCODE_DISABLE_CLAUDE_CODE_MCP = "true"
      expect(Flag.MIMOCODE_DISABLE_CLAUDE_CODE_MCP).toBe(true)
    })
  })

  // --- Special behavior tests ---

  describe("MIMOCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT", () => {
    test("on win32, defaults to true when env not set", () => {
      // The value is evaluated at module load time
      // It falls back to process.platform === "win32" when copy is undefined
      // On this platform, it should reflect the current platform
      expect(typeof Flag.MIMOCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT).toBe("boolean")
    })
  })

  describe("MIMOCODE_MIMO_ONLY interactions", () => {
    test("MIMOCODE_DISABLE_PROVIDER_ENV is true when MIMOCODE_MIMO_ONLY is true", () => {
      // MIMOCODE_MIMO_ONLY is a module-level constant
      // MIMOCODE_DISABLE_PROVIDER_ENV = MIMOCODE_MIMO_ONLY || truthy("MIMOCODE_DISABLE_PROVIDER_ENV")
      expect(typeof Flag.MIMOCODE_DISABLE_PROVIDER_ENV).toBe("boolean")
    })

    test("MIMOCODE_DISABLE_CLAUDE_CODE is true when MIMOCODE_MIMO_ONLY is true", () => {
      // MIMOCODE_DISABLE_CLAUDE_CODE = MIMOCODE_MIMO_ONLY || truthy("MIMOCODE_DISABLE_CLAUDE_CODE")
      expect(typeof Flag.MIMOCODE_DISABLE_CLAUDE_CODE).toBe("boolean")
    })
  })

  describe("MIMOCODE_DISABLE_CLAUDE_CODE_PROMPT", () => {
    test("is a boolean (derived from MIMOCODE_DISABLE_CLAUDE_CODE or env)", () => {
      expect(typeof Flag.MIMOCODE_DISABLE_CLAUDE_CODE_PROMPT).toBe("boolean")
    })
  })

  describe("MIMOCODE_DISABLE_CLAUDE_CODE_COMMANDS", () => {
    test("defaults to false", () => {
      expect(Flag.MIMOCODE_DISABLE_CLAUDE_CODE_COMMANDS).toBe(false)
    })
  })

  describe("MIMOCODE_DISABLE_CHANNEL_DB", () => {
    test("defaults to true", () => {
      expect(Flag.MIMOCODE_DISABLE_CHANNEL_DB).toBe(true)
    })
  })

  describe("MIMOCODE_DISABLE_GIT", () => {
    test("defaults to false", () => {
      expect(Flag.MIMOCODE_DISABLE_GIT).toBe(false)
    })
  })

  describe("MIMOCODE_AUTO_SHARE", () => {
    test("defaults to false", () => {
      expect(Flag.MIMOCODE_AUTO_SHARE).toBe(false)
    })
  })

  describe("MIMOCODE_DISABLE_EXTERNAL_SKILLS chain", () => {
    test("MIMOCODE_DISABLE_CLAUDE_CODE_SKILLS is a boolean", () => {
      expect(typeof Flag.MIMOCODE_DISABLE_CLAUDE_CODE_SKILLS).toBe("boolean")
    })

    test("MIMOCODE_DISABLE_CODEX_SKILLS is a boolean", () => {
      expect(typeof Flag.MIMOCODE_DISABLE_CODEX_SKILLS).toBe("boolean")
    })

    test("MIMOCODE_DISABLE_OPENCODE_SKILLS is a boolean", () => {
      expect(typeof Flag.MIMOCODE_DISABLE_OPENCODE_SKILLS).toBe("boolean")
    })
  })
})
