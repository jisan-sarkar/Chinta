import { describe, expect, it } from "vitest";

import { getOAuthCallbackError } from "./oauth-callback";

describe("OAuth callback handling", () => {
  it("returns undefined when no OAuth error exists", () => {
    expect(getOAuthCallbackError("?state=abc")).toBeUndefined();
  });

  it("formats Google OAuth error descriptions", () => {
    expect(
      getOAuthCallbackError("?error_description=access_denied"),
    ).toBe("Google sign-in failed: access_denied");
  });

  it("falls back to generic error params", () => {
    expect(getOAuthCallbackError("?error=oauth_failed")).toBe(
      "Google sign-in failed: oauth_failed",
    );
  });
});
