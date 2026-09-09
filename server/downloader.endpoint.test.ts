import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function caller() {
  return appRouter.createCaller({
    user: null,
    req: { ip: `endpoint-test-${Math.random()}`, headers: {}, socket: {} } as any,
    res: {} as any,
  } as any);
}

describe("downloader endpoint failures", () => {
  it("reports non-OK provider responses", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response("forbidden", { status: 403 })));
    vi.stubGlobal("fetch", fetchMock);
    await expect(caller().downloader.download({ url: "https://www.tiktok.com/@creator/video/123", quality: "720p" })).rejects.toThrow("returned 403");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports provider business errors without retrying", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, code: "insufficient_credits", message: "You are 1 credit short." }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(caller().downloader.download({ url: "https://www.tiktok.com/@creator/video/123" })).rejects.toThrow("no credits available");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects a provider payload without a usable URL", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "ok" }), { status: 200 })));
    await expect(caller().downloader.download({ url: "https://www.tiktok.com/@creator/video/124", quality: "720p" })).rejects.toThrow("usable download URL");
  });

  it("converts provider timeout into a user-safe error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(Object.assign(new Error("aborted"), { name: "AbortError" })));
    await expect(caller().downloader.download({ url: "https://www.tiktok.com/@creator/video/125", quality: "720p" })).rejects.toThrow("timed out");
  });
});

it("uses the correct download contract for TikTok, YouTube, and Instagram", async () => {
  const calls: string[] = [];
  vi.stubGlobal("fetch", vi.fn().mockImplementation((input: string) => {
    calls.push(input);
    return Promise.resolve(new Response(JSON.stringify({ success: true, data: { title: "Video", downloadUrl: "https://downloads.example.test/video.mp4", format: "mp4", quality: "720p" } }), { status: 200 }));
  }));
  const urls = ["https://www.tiktok.com/@a/video/1", "https://www.youtube.com/watch?v=abcdefghijk", "https://www.instagram.com/reel/ABC/ ".trim()];
  for (const url of urls) await caller().downloader.download({ url, quality: "720p" });
  expect(calls).toEqual([
    "https://api.socialkit.dev/tiktok/download",
    "https://api.socialkit.dev/youtube/download",
    "https://api.socialkit.dev/instagram/download",
  ]);
});

it("requests the highest documented video quality when preview returned no quality list", async () => {
  let body = "";
  vi.stubGlobal("fetch", vi.fn().mockImplementation((_input: string, init?: RequestInit) => {
    body = String(init?.body || "");
    return Promise.resolve(new Response(JSON.stringify({ success: true, data: { downloadUrl: "https://downloads.example.test/default.mp4", format: "mp4" } }), { status: 200 }));
  }));
  const result = await caller().downloader.download({ url: "https://www.youtube.com/watch?v=abcdefghijk" });
  expect(result.downloadToken).toMatch(/^[0-9a-f-]{36}$/i);
  expect(JSON.parse(body)).toMatchObject({ format: "mp4", quality: "1080p" });
});

it("keeps Facebook preview-only when no Facebook download endpoint is configured", async () => {
  await expect(caller().downloader.download({ url: "https://www.facebook.com/watch/?v=123", quality: "720p" })).rejects.toThrow("download is not supported");
});

it("preserves missing metadata as empty/undefined while keeping a valid download URL", async () => {
  vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ success: true, data: { downloadUrl: "https://downloads.example.test/partial.mp4", format: "mp4", quality: "720p" } }), { status: 200 }))));
  const urls = ["https://www.tiktok.com/@a/video/301", "https://www.youtube.com/watch?v=abcdefghijk", "https://www.instagram.com/reel/PARTIAL/"];
  for (const url of urls) {
    const result = await caller().downloader.download({ url, quality: "720p" });
    expect(result.downloadToken).toMatch(/^[0-9a-f-]{36}$/i);
    expect(result.title).toBe("");
    expect(result.thumbnail).toBeUndefined();
    expect(result.views).toBeUndefined();
  }
});
