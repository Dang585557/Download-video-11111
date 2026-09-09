import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SocialKit preview metadata contract", () => {
  it("maps provider metadata into the frontend preview shape without inventing fields", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: {
        title: "Provider title",
        channelName: "provider_author",
        thumbnailUrl: "https://cdn.example.test/thumbnail.jpg",
        views: 12,
        likes: 3,
        comments: 1,
        shares: 2,
        collects: 0,
        duration: "0:12",
        publishedAt: "2026-01-01T00:00:00.000Z",
        quality: "720p",
      },
    }), { status: 200 })));

    const result = await appRouter.createCaller({
      user: null,
      req: { ip: `preview-contract-${Math.random()}`, headers: {}, socket: {} } as any,
      res: {} as any,
    } as any).downloader.preview({ url: "https://www.tiktok.com/@provider/video/123" });

    expect(result.platform).toBe("tiktok");
    expect(result.title).toBe("Provider title");
    expect(result.author).toBe("provider_author");
    expect(result.thumbnail).toBe("https://cdn.example.test/thumbnail.jpg");
    expect(result.views).toBe(12);
    expect(result.likes).toBe(3);
    expect(result.comments).toBe(1);
    expect(result.shares).toBe(2);
    expect(result.saves).toBe(0);
    expect(result.qualities).toContain("720p");
  });

  it("supports preview contracts for all four platform stats endpoints", async () => {
    const urls = [
      "https://www.tiktok.com/@provider/video/201",
      "https://www.youtube.com/watch?v=video202",
      "https://www.facebook.com/watch/?v=203",
      "https://www.instagram.com/reel/ABC204/",
    ];
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ success: true, data: { title: "Provider response" } }), { status: 200 }))));
    for (const url of urls) {
      const result = await appRouter.createCaller({ user: null, req: { ip: `multi-preview-${Math.random()}`, headers: {}, socket: {} } as any, res: {} as any } as any).downloader.preview({ url });
      expect(result.title).toBe("Provider response");
      expect(result.platform).toBeTruthy();
    }
  });

  it("returns a clear error when the provider identifies a private or non-video item", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { isVideo: false } }), { status: 200 })));
    await expect(appRouter.createCaller({ user: null, req: { ip: `private-preview-${Math.random()}`, headers: {}, socket: {} } as any, res: {} as any } as any).downloader.preview({ url: "https://www.instagram.com/reel/PRIVATE/" })).rejects.toThrow("not a video");
  });
});
