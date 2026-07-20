import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("merges conditional class names", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toContain("px-4");
  });
});
