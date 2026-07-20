import { describe, expect, it } from "vitest";

import {
  createConversationRequestSchema,
  streamChatRequestSchema,
} from "./index";

describe("shared schemas", () => {
  it("defaults temporary conversations to false", () => {
    expect(createConversationRequestSchema.parse({ title: "Hello" })).toEqual({
      title: "Hello",
      temporary: false,
    });
  });

  it("accepts a text-only chat request", () => {
    expect(
      streamChatRequestSchema.parse({
        modelId: "openai/gpt-4.1",
        parts: [{ type: "text", text: "Hello" }],
      }),
    ).toMatchObject({
      modelId: "openai/gpt-4.1",
      parts: [{ type: "text", text: "Hello" }],
    });
  });
});
