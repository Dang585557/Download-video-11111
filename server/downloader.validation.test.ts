import { describe, expect, it } from "vitest";
import { detectPlatform, isAllowedDownloadRequest, isSafeSocialUrl, isSafeTikTokUrl } from "./routers";

describe("downloader input safety", () => {
  it("detects the supported source platform from each URL family", () => {
    expect(detectPlatform("https://vt.tiktok.com/ZMabc123/")).toBe("tiktok");
    expect(detectPlatform("https://youtu.be/dQw4w9WgXcQ")).toBe("youtube");
    expect(detectPlatform("https://www.facebook.com/watch/?v=123")).toBe("facebook");
    expect(detectPlatform("https://www.instagram.com/reel/ABC123/")).toBe("instagram");
    expect(isSafeSocialUrl("https://youtube.com.evil.example/watch?v=123")).toBe(false);
  });

  it("accepts TikTok hosts and rejects lookalike or non-http URLs", () => {
    expect(isSafeTikTokUrl("https://www.tiktok.com/@creator/video/123")).toBe(true);
    expect(isSafeTikTokUrl("https://vm.tiktok.com/ZMabc123/")).toBe(true);
    expect(isSafeTikTokUrl("https://tiktok.com.evil.example/video/123")).toBe(false);
    expect(isSafeTikTokUrl("https://127.0.0.1/@creator/video/123")).toBe(false);
    expect(isSafeTikTokUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeTikTokUrl("not a url")).toBe(false);
  });

  it("allows five requests per client within a window and rejects the sixth", () => {
    const client = `test-${Date.now()}-${Math.random()}`;
    const now = 1_700_000_000_000;
    expect(Array.from({ length: 5 }, () => isAllowedDownloadRequest(client, now))).toEqual([true, true, true, true, true]);
    expect(isAllowedDownloadRequest(client, now)).toBe(false);
    expect(isAllowedDownloadRequest(client, now + 60_001)).toBe(true);
  });
});
