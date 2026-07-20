import { afterEach, describe, expect, it, vi } from "vitest";

import { OpenRouterProvider } from "./openrouter.provider";

describe("OpenRouterProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("validates credentials with the current key endpoint", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true } as Response);
    const provider = new OpenRouterProvider();

    await expect(provider.validateCredential("sk-or-test")).resolves.toEqual({
      valid: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/key",
      {
        headers: { authorization: "Bearer sk-or-test" },
      },
    );
  });
});
