import type { Express, Request, Response } from "express";
import { Readable } from "node:stream";
import { consumeDownloadToken } from "./downloadTokens";

const DOWNLOAD_TIMEOUT_MS = 60_000;

export function registerDownloadProxy(app: Express) {
  app.get("/api/download/:token", async (req: Request, res: Response) => {
    const token = String(req.params.token || "");
    const record = consumeDownloadToken(token);
    if (!record) {
      res.status(404).json({ error: "Download link expired or already used." });
      return;
    }

    let upstreamUrl: URL;
    try {
      upstreamUrl = new URL(record.url);
      if (upstreamUrl.protocol !== "https:") throw new Error("Unsafe download URL");
    } catch {
      res.status(502).json({ error: "The provider returned an invalid download URL." });
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
    try {
      const upstream = await fetch(upstreamUrl, { signal: controller.signal, redirect: "follow" });
      if (!upstream.ok || !upstream.body) {
        res.status(502).json({ error: "The provider could not deliver the video file." });
        return;
      }

      const contentType = upstream.headers.get("content-type") || "application/octet-stream";
      if (/text\/html|application\/json/i.test(contentType)) {
        res.status(502).json({ error: "The provider returned an invalid video response." });
        return;
      }

      const safeFilename = record.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      res.status(200);
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
      res.setHeader("Cache-Control", "no-store");
      const length = upstream.headers.get("content-length");
      if (length) res.setHeader("Content-Length", length);
      Readable.fromWeb(upstream.body as never).pipe(res);
    } catch (error) {
      if (!res.headersSent) {
        const message = error instanceof Error && error.name === "AbortError" ? "The video download timed out." : "The video download failed.";
        res.status(502).json({ error: message });
      } else {
        res.destroy(error instanceof Error ? error : undefined);
      }
    } finally {
      clearTimeout(timeout);
    }
  });
}
