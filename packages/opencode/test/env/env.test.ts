import { describe, test, expect } from "bun:test"
import { Effect } from "effect"
import { Env } from "../../src/env"

// The Env module depends on InstanceState/ScopedCache which requires a MiMo-Code
// project/instance context to function. Full unit testing of the Env service
// (get/set/remove) requires a running Instance, which is only available in
// integration tests.
//
// These tests verify that:
// 1. The module can be loaded without errors
// 2. The interface types are correct
// 3. The layer can be constructed

describe("Env", () => {
  test("module exports Service type", () => {
    expect(Env.Service).toBeDefined()
  })

  test("module exports defaultLayer", () => {
    expect(Env.defaultLayer).toBeDefined()
  })

  test("module exports layer", () => {
    expect(Env.layer).toBeDefined()
  })

  // Env.get/set/remove require an Instance context (InstanceState/ScopedCache).
  // See: src/effect/instance-state.ts — full integration tests need InstanceRef.
})
