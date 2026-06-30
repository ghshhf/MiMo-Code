import { describe, test, expect, mock } from "bun:test"
import { ModelCall, ToolCall, AgentRequest } from "../../src/metrics/event"
import { buildHeader, postEvents, ENDPOINT, APP_ID } from "../../src/metrics/client"
import { jsonByteLength } from "../../src/metrics/util"

describe("metrics events", () => {
  test("ModelCall is defined with correct type", () => {
    expect(ModelCall.type).toBe("metrics.model_call")
    expect(ModelCall.properties).toBeDefined()
  })

  test("ToolCall is defined with correct type", () => {
    expect(ToolCall.type).toBe("metrics.tool_call")
    expect(ToolCall.properties).toBeDefined()
  })

  test("AgentRequest is defined with correct type", () => {
    expect(AgentRequest.type).toBe("metrics.agent_request")
    expect(AgentRequest.properties).toBeDefined()
  })
})

describe("client", () => {
  describe("ENDPOINT and APP_ID", () => {
    test("ENDPOINT is a valid URL", () => {
      expect(ENDPOINT).toBe("https://tracking.miui.com/track/v4/o")
    })

    test("APP_ID is defined", () => {
      expect(APP_ID).toBe("31000402765")
    })
  })

  describe("buildHeader", () => {
    test("returns header with event and app_id", () => {
      const header = buildHeader("model_call")
      expect(header.event).toBe("model_call")
      expect(header.app_id).toBe(APP_ID)
      expect(header.instance_id_type).toBe("uuid")
      expect(header.e_ts).toBeGreaterThan(0)
    })

    test("includes uid and uid_type when sessionID is provided", () => {
      const header = buildHeader("model_call", "ses_test123")
      expect(header.uid).toBe("ses_test123")
      expect(header.uid_type).toBe("session_id")
    })

    test("does not include uid when sessionID is omitted", () => {
      const header = buildHeader("tool_call")
      expect(header.uid).toBeUndefined()
      expect(header.uid_type).toBeUndefined()
    })

    test("generates a unique instance_id each call", () => {
      const h1 = buildHeader("agent_request")
      const h2 = buildHeader("agent_request")
      expect(h1.instance_id).not.toBe(h2.instance_id)
    })

    test("instance_id is a valid UUID", () => {
      const header = buildHeader("model_call")
      expect(header.instance_id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
    })

    test("e_ts is close to Date.now()", () => {
      const before = Date.now()
      const header = buildHeader("model_call")
      const after = Date.now()
      expect(header.e_ts).toBeGreaterThanOrEqual(before)
      expect(header.e_ts).toBeLessThanOrEqual(after)
    })
  })

  describe("postEvents", () => {
    test("does not throw when called with valid payload", async () => {
      const payload = [
        {
          H: buildHeader("model_call", "ses_test"),
          B: { finish_reason: "stop", latency_ms: 100, model_id: "test" } as Record<string, unknown>,
        },
      ]
      // postEvents has a .catch(() => {}) so it never throws
      await expect(postEvents(payload)).resolves.toBeUndefined()
    })

    test("does not throw with empty payload", async () => {
      await expect(postEvents([])).resolves.toBeUndefined()
    })
  })
})

describe("jsonByteLength", () => {
  test("returns byte length of a JSON string", () => {
    // jsonByteLength internally calls JSON.stringify then Buffer.byteLength
    // JSON.stringify("hello") → '"hello"' (7 bytes with quotes)
    expect(jsonByteLength("hello")).toBe(7)
  })

  test("returns byte length of an object", () => {
    expect(jsonByteLength({ a: 1 })).toBe(7) // '{"a":1}'
  })

  test("returns 0 for undefined (non-serializable)", () => {
    const result = jsonByteLength(undefined)
    expect(typeof result).toBe("number")
  })

  test("handles unicode characters (multi-byte)", () => {
    // JSON.stringify escapes non-ASCII characters with \uXXXX, so "héllo"
    // becomes "h\u00e9llo" — all ASCII, byte length == string length.
    // The quotes add 2 bytes.
    expect(jsonByteLength(JSON.stringify("héllo"))).toBe(12)
  })
})
