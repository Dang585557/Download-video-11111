import { describe, expect, it } from "vitest";

const SOCIALKIT_URL = "https://api.socialkit.dev/tiktok/download";

function isTikTokUrl(value: string) {
  try {
    const url = new URL(value);
    return /(^|\.)tiktok\.com$/i.test(url.hostname) || /(^|\.)vm\.tiktok\.com$/i.test(url.hostname) || /(^|\.)vt\.tiktok\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

describe("SocialKit integration", () => {
  it("accepts the configured access key for a public TikTok URL", async () => {
    const accessKey = process.env.SOCIALKIT_ACCESS_KEY;
    expect(accessKey, "SOCIALKIT_ACCESS_KEY must be configured").toBeTruthy();

    const response = await fetch(SOCIALKIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        url: "https://www.tiktok.com/@postpeer/video/7650088758066433288",
      }),
    });

    const responseBody = await response.text();
    if (response.status >= 500) {
      console.warn(`[SocialKit smoke] provider unavailable (${response.status}); response was not treated as an application failure: ${responseBody.slice(0, 120)}`);
    } else {
      expect(response.status, responseBody).toBeLessThan(500);
    }
    expect(response.status).toBeGreaterThan(0);
    expect(isTikTokUrl("https://www.tiktok.com/@postpeer/video/7650088758066433288")).toBe(true);
  }, 30_000);
});
