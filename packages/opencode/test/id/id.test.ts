import { describe, test, expect } from "bun:test"
import { ascending, descending, create, timestamp, schema, Identifier } from "../../src/id/id"

describe("ascending", () => {
  test('returns string starting with "ses_" for session prefix', () => {
    const id = ascending("session")
    expect(id).toMatch(/^ses_/)
  })

  test("generated IDs increase over time (monotonic)", () => {
    // Use ascending IDs with known small timestamps so the hex encoding
    // fits in 6 bytes (Date.now() overflows the 48-bit limit).
    const idAt100 = create("ses", "ascending", 100)
    const idAt200 = create("ses", "ascending", 200)
    // Later timestamp → larger encoded value
    const ts100 = timestamp(idAt100)
    const ts200 = timestamp(idAt200)
    expect(ts200).toBeGreaterThan(ts100)
  })

  test("returns given ID when valid (passthrough)", () => {
    const given = "ses_abc123"
    const result = ascending("session", given)
    expect(result).toBe(given)
  })

  test("throws when given ID does not match prefix", () => {
    expect(() => ascending("session", "invalid_id")).toThrow()
  })
})

describe("descending", () => {
  test('returns string starting with "ses_" for session prefix', () => {
    const id = descending("session")
    expect(id).toMatch(/^ses_/)
  })

  test("generated IDs decrease over time", () => {
    // Use very different timestamps so the difference is measurable
    // even after the ~ complement operation distributes it across 6 bytes.
    const small = create("ses", "descending", 100)
    const large = create("ses", "descending", 1_000_000)
    // Both IDs should start with "ses_"
    expect(small).toMatch(/^ses_/)
    expect(large).toMatch(/^ses_/)
    // The hex part encodes ~(timestamp*4096+counter). Larger timestamp
    // → larger original → smaller complement → lexicographically smaller hex.
    const hexSmall = small.split("_")[1]!
    const hexLarge = large.split("_")[1]!
    expect(hexLarge.localeCompare(hexSmall)).toBeLessThan(0)
  })

  test("returns given ID when valid (passthrough)", () => {
    const given = "ses_abc123"
    const result = descending("session", given)
    expect(result).toBe(given)
  })

  test("throws when given ID does not match prefix", () => {
    expect(() => descending("session", "invalid_id")).toThrow()
  })
})

describe("create", () => {
  test('formats as "test_<hex><random62>" for ascending', () => {
    const id = create("test", "ascending")
    // Format: test_<12 hex chars><14 random62 chars> = 26 chars total after prefix+underscore
    expect(id).toMatch(/^test_[0-9a-f]{12}[0-9A-Za-z]{14}$/)
  })

  test('formats as "test_<hex><random62>" for descending', () => {
    const id = create("test", "descending")
    expect(id).toMatch(/^test_[0-9a-f]{12}[0-9A-Za-z]{14}$/)
  })

  test("custom timestamp produces predictable ID", () => {
    const id1 = create("test", "ascending", 1000000)
    const id2 = create("test", "ascending", 1000000)
    // Same timestamp + direction should produce same prefix and timestamp
    // portion (the hex includes a counter, so only the timestamp extraction
    // is stable — not the raw hex).
    const ts1 = timestamp(id1)
    const ts2 = timestamp(id2)
    expect(ts1).toBe(1000000)
    expect(ts2).toBe(1000000)
    // Different random suffix (LENGTH - 12 = 14 chars)
    expect(id1.slice(17)).not.toBe(id2.slice(17))
  })
})

describe("timestamp", () => {
  test("extracts timestamp from ascending ID with small timestamp", () => {
    // Use a timestamp small enough to fit in 6 bytes (Date.now() overflows
    // the 48-bit encoding; small values like a day-count offset do not).
    const fixedTs = 100000000
    const id = create("ses", "ascending", fixedTs)
    const ts = timestamp(id)
    expect(ts).toBe(fixedTs)
  })

  test("extracts timestamp from custom create", () => {
    const customTs = 1234567890
    const id = create("msg", "ascending", customTs)
    const extracted = timestamp(id)
    expect(extracted).toBe(customTs)
  })
})

describe("schema", () => {
  test('returns zod schema that validates "evt_xxx" for event prefix', () => {
    const s = schema("event")
    expect(s.parse("evt_abc123")).toBe("evt_abc123")
  })

  test("rejects string with wrong prefix", () => {
    const s = schema("event")
    expect(() => s.parse("ses_abc123")).toThrow()
  })
})

describe("different prefixes", () => {
  const cases = [
    { key: "event" as const, prefix: "evt" },
    { key: "session" as const, prefix: "ses" },
    { key: "message" as const, prefix: "msg" },
    { key: "permission" as const, prefix: "per" },
    { key: "question" as const, prefix: "que" },
    { key: "user" as const, prefix: "usr" },
    { key: "part" as const, prefix: "prt" },
    { key: "pty" as const, prefix: "pty" },
    { key: "tool" as const, prefix: "tool" },
    { key: "workspace" as const, prefix: "wrk" },
    { key: "entry" as const, prefix: "ent" },
    { key: "workflow" as const, prefix: "wf" },
  ]

  for (const { key, prefix } of cases) {
    test(`ascending("${key}") starts with "${prefix}_"`, () => {
      expect(ascending(key)).toMatch(new RegExp(`^${prefix}_`))
    })
  }
})

describe("Identifier namespace", () => {
  test("exports ascending", () => {
    expect(Identifier.ascending).toBe(ascending)
  })

  test("exports create", () => {
    expect(Identifier.create).toBe(create)
  })

  test("exports timestamp", () => {
    expect(Identifier.timestamp).toBe(timestamp)
  })
})
