import { describe, test, expect } from "bun:test"
import { convertMessages } from "./message"

describe("convertMessages", () => {
  test("纯文本对话：简单的 user → assistant 交替", () => {
    const result = convertMessages([
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
      { role: "user", content: "How are you?" },
    ])
    expect(result).toBe("Hello\n\nHi there!\n\nHow are you?")
  })

  test("system message → [系统指令] 前缀", () => {
    const result = convertMessages([
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Tell me a joke." },
    ])
    expect(result).toBe("[系统指令] You are a helpful assistant.\n\nTell me a joke.")
  })

  test("tool_call + tool_result → 自然语言合并", () => {
    const result = convertMessages([
      { role: "user", content: "What's the weather in Beijing?" },
      {
        role: "assistant",
        content: "Let me check the weather.",
        tool_calls: [
          {
            id: "call_123",
            type: "function",
            function: { name: "get_weather", arguments: '{"city":"Beijing"}' },
          },
        ],
      },
      { role: "tool", content: '{"temperature": 22, "condition": "sunny"}', tool_call_id: "call_123" },
      { role: "assistant", content: "The weather in Beijing is 22°C and sunny." },
    ])
    expect(result).toBe(
      "What's the weather in Beijing?\n\n" +
        "Let me check the weather.\n\n" +
        "[工具调用: get_weather]\n```json\n{\"city\":\"Beijing\"}\n```\n\n" +
        "[工具结果]\n{\"temperature\": 22, \"condition\": \"sunny\"}\n\n" +
        "The weather in Beijing is 22°C and sunny.",
    )
  })

  test("混合消息序列：system + 多轮 tool 调用", () => {
    const result = convertMessages([
      { role: "system", content: "You are a math tutor." },
      { role: "user", content: "Solve 2+2." },
      {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "calc_1",
            type: "function",
            function: { name: "calculator", arguments: '{"expr":"2+2"}' },
          },
        ],
      },
      { role: "tool", content: "4", tool_call_id: "calc_1" },
      { role: "assistant", content: "The answer is 4." },
    ])
    expect(result).toContain("[系统指令] You are a math tutor.")
    expect(result).toContain("Solve 2+2.")
    expect(result).toContain("[工具调用: calculator]")
    expect(result).toContain('"expr":"2+2"')
    expect(result).toContain("[工具结果]")
    expect(result).toContain("The answer is 4.")
  })

  test("user message with null content is skipped", () => {
    const result = convertMessages([
      { role: "user", content: null },
      { role: "assistant", content: "Response" },
    ])
    expect(result).toBe("Response")
  })

  test("assistant with tool_calls but no content", () => {
    const result = convertMessages([
      { role: "user", content: "Search for cats" },
      {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "search_1",
            type: "function",
            function: { name: "search", arguments: '{"q":"cats"}' },
          },
        ],
      },
    ])
    expect(result).toContain("Search for cats")
    expect(result).toContain("[工具调用: search]")
    expect(result).toContain('{"q":"cats"}')
  })

  test("empty messages returns empty string", () => {
    const result = convertMessages([])
    expect(result).toBe("")
  })

  test("multiple tool_calls in a single assistant message", () => {
    const result = convertMessages([
      { role: "user", content: "Compare two files" },
      {
        role: "assistant",
        content: "Let me check both files.",
        tool_calls: [
          {
            id: "read_1",
            type: "function",
            function: { name: "read_file", arguments: '{"path":"a.txt"}' },
          },
          {
            id: "read_2",
            type: "function",
            function: { name: "read_file", arguments: '{"path":"b.txt"}' },
          },
        ],
      },
    ])
    expect(result).toContain("[工具调用: read_file]")
    expect(result).toContain('"path":"a.txt"')
    expect(result).toContain('"path":"b.txt"')
    // Should contain two separate tool call blocks
    const matches = result.match(/\[工具调用: read_file\]/g)
    expect(matches).toHaveLength(2)
  })

  test("tool result with non-string content is JSON-stringified", () => {
    const result = convertMessages([
      { role: "user", content: "What's in the data?" },
      {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "data_1",
            type: "function",
            function: { name: "get_data", arguments: "{}" },
          },
        ],
      },
      // @ts-expect-error - testing non-string content
      { role: "tool", content: { result: [1, 2, 3] }, tool_call_id: "data_1" },
    ])
    expect(result).toContain("[工具结果]")
    expect(result).toContain('{"result":[1,2,3]}')
  })
})
