import { describe, expect, it, vi, afterEach } from "vitest";
import { PassThrough } from "node:stream";
import { registerDownloadProxy } from "./downloadProxy";
import { createDownloadToken } from "./downloadTokens";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("download proxy", () => {
  it("streams the provider file as an attachment", async () => {
    let handler: ((req: any, res: any) => Promise<void>) | undefined;
    registerDownloadProxy({ get: (_path: string, route: any) => { handler = route; } } as any);
    const token = createDownloadToken("https://downloads.example.test/video.mp4", "clipsignal-video.mp4");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("video-bytes", {
      status: 200,
      headers: { "content-type": "video/mp4", "content-length": "11" },
    })));

    const output = new PassThrough();
    const chunks: Buffer[] = [];
    output.on("data", chunk => chunks.push(Buffer.from(chunk)));
    const finished = new Promise<void>((resolve, reject) => {
      output.on("finish", resolve);
      output.on("error", reject);
    });
    const headers: Record<string, string> = {};
    const response = Object.assign(output, {
      status: vi.fn(() => response),
      setHeader: vi.fn((key: string, value: string) => { headers[key] = value; return response; }),
      json: vi.fn((body: unknown) => { response.statusCode = 500; response.end(JSON.stringify(body)); }),
      headersSent: false,
    });

    await handler?.({ params: { token } }, response);
    await finished;

    expect(headers["Content-Type"]).toBe("video/mp4");
    expect(headers["Content-Disposition"]).toContain("attachment");
    expect(Buffer.concat(chunks).toString()).toBe("video-bytes");
  });

  it("rejects an expired or already-consumed token", async () => {
    let handler: ((req: any, res: any) => Promise<void>) | undefined;
    registerDownloadProxy({ get: (_path: string, route: any) => { handler = route; } } as any);
    const response = {
      status: vi.fn(function(this: any) { return this; }),
      json: vi.fn(),
    } as any;

    await handler?.({ params: { token: "not-a-token" } }, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ error: "Download link expired or already used." });
  });
});
