import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createDownloadToken } from "./downloadTokens";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const attempts = new Map<string, number[]>();
const PLATFORM_HOSTS = {
  tiktok: /(^|\.)tiktok\.com$/i,
  youtube: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i,
  instagram: /(^|\.)instagram\.com$/i,
  facebook: /(^|\.)facebook\.com$|(^|\.)fb\.watch$/i,
} as const;
const downloadEndpoints = {
  tiktok: "https://api.socialkit.dev/tiktok/download",
  youtube: "https://api.socialkit.dev/youtube/download",
  instagram: "https://api.socialkit.dev/instagram/download",
} as const;
const statsEndpoints = {
  tiktok: "https://api.socialkit.dev/tiktok/stats",
  youtube: "https://api.socialkit.dev/youtube/stats",
  instagram: "https://api.socialkit.dev/instagram/stats",
  facebook: "https://api.socialkit.dev/facebook/stats",
} as const;

export function isAllowedDownloadRequest(clientKey: string, now = Date.now()) {
  const recent = (attempts.get(clientKey) ?? []).filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) { attempts.set(clientKey, recent); return false; }
  recent.push(now); attempts.set(clientKey, recent); return true;
}

export type SupportedPlatform = keyof typeof PLATFORM_HOSTS;

export function detectPlatform(value: string): SupportedPlatform | null {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    const host = parsed.hostname.toLowerCase();
    return (Object.entries(PLATFORM_HOSTS).find(([, pattern]) => pattern.test(host))?.[0] as SupportedPlatform | undefined) ?? null;
  } catch { return null; }
}

export function isSafeSocialUrl(value: string) { return detectPlatform(value) !== null; }
export const isSafeTikTokUrl = (value: string) => detectPlatform(value) === "tiktok";

function valueOf(data: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) if (data[key] !== undefined && data[key] !== null && data[key] !== "") return data[key];
  return undefined;
}

function normalizeMetadata(platform: SupportedPlatform, originalUrl: string, payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : root;
  if (data.isVideo === false || data.contentType === "carousel") throw new Error("The URL is not a video.");
  return {
    platform,
    url: originalUrl,
    title: String(valueOf(data, "title", "description") ?? ""),
    author: valueOf(data, "author", "channelName", "channelHandle", "username"),
    profilePicture: valueOf(data, "profilePicture", "avatar", "avatarUrl", "authorAvatar"),
    thumbnail: valueOf(data, "thumbnail", "thumbnailUrl"),
    views: valueOf(data, "views", "viewCount"),
    likes: valueOf(data, "likes", "likeCount"),
    comments: valueOf(data, "comments", "commentCount"),
    shares: valueOf(data, "shares", "shareCount"),
    saves: valueOf(data, "collects", "saves", "saveCount"),
    publishedAt: valueOf(data, "publishedAt", "timestamp"),
    duration: valueOf(data, "duration"),
    durationSeconds: valueOf(data, "durationSeconds"),
    fileSize: valueOf(data, "fileSizeMB", "fileSize"),
    qualities: Array.isArray(data.qualities) ? data.qualities.filter((item): item is string => typeof item === "string") : (typeof data.quality === "string" ? [data.quality] : []),
    canDownload: platform !== "facebook",
  };
}

async function socialFetch(url: string, init?: RequestInit) {
  const retryableStatuses = new Set([429, 502, 503, 504]);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      const text = await response.text();
      let payload: unknown; try { payload = JSON.parse(text); } catch { payload = null; }
      if (payload && typeof payload === "object" && (payload as any).success === false) {
        const code = String((payload as any).code || "");
        const message = code === "insufficient_credits" ? "The download provider has no credits available. Please try again later." : String((payload as any).message || "The provider could not process this video.");
        throw new Error(`Provider business error: ${message}`);
      }
      if (!response.ok) {
        const message = response.status === 429 ? "The download service is busy. Please wait a minute and try again." : [502, 503, 504].includes(response.status) ? "The download service is temporarily unavailable. Please try again shortly." : `SocialKit returned ${response.status}.`;
        const error = new Error(message);
        if (attempt === 0 && retryableStatuses.has(response.status)) {
          lastError = error;
          await new Promise(resolve => setTimeout(resolve, 600));
          continue;
        }
        throw error;
      }
      return payload;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw new Error("The service timed out. Please try again.");
      lastError = error instanceof Error ? error : new Error("The service is unavailable.");
      if (lastError.message.startsWith("Provider business error:") || lastError.message.startsWith("SocialKit returned ") || lastError.message.startsWith("The download service is busy") || lastError.message.startsWith("The download service is temporarily unavailable")) throw lastError;
      if (attempt === 0) {
        await new Promise(resolve => setTimeout(resolve, 600));
        continue;
      }
      throw lastError;
    } finally { clearTimeout(timeout); }
  }

  throw lastError ?? new Error("The service is unavailable.");
}

const inputShape = z.object({ url: z.string().trim().url().max(2048) });
const downloadInput = inputShape.extend({ format: z.enum(["mp4", "mp3", "avi", "webm", "m4a", "ogg", "wav"]).default("mp4"), quality: z.enum(["240p", "360p", "480p", "720p", "1080p"]).optional() });
const MAX_DOCUMENTED_VIDEO_QUALITY = "1080p" as const;
const VIDEO_FORMATS = new Set(["mp4", "avi", "webm"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const options = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...options, maxAge: -1 }); return { success: true } as const; }),
  }),
  downloader: router({
    preview: publicProcedure.input(inputShape).mutation(async ({ input, ctx }) => {
      const platform = detectPlatform(input.url);
      if (!platform) throw new Error("Unsupported URL. Use a public TikTok, YouTube, Facebook, or Instagram video URL.");
      const accessKey = process.env.SOCIALKIT_ACCESS_KEY;
      if (!accessKey) throw new Error("Preview service is not configured.");
      const params = new URLSearchParams({ access_key: accessKey, url: input.url, cache: "true", cache_ttl: "2592000" });
      const payload = await socialFetch(`${statsEndpoints[platform]}?${params}`);
      const metadata = normalizeMetadata(platform, input.url, payload);
      if (!metadata) throw new Error("Unable to retrieve video information.");
      return metadata;
    }),
    download: publicProcedure.input(downloadInput).mutation(async ({ input, ctx }) => {
      const platform = detectPlatform(input.url);
      if (!platform) throw new Error("Unsupported URL.");
      if (platform === "facebook") throw new Error("Facebook preview is available, but download is not supported by the current API.");
      if (!isAllowedDownloadRequest(ctx.req.ip || ctx.req.socket?.remoteAddress || "unknown")) throw new Error("Too many download requests. Please wait a minute and try again.");
      const accessKey = process.env.SOCIALKIT_ACCESS_KEY;
      if (!accessKey) throw new Error("Download service is not configured.");
      const requestedQuality = input.quality ?? (VIDEO_FORMATS.has(input.format) ? MAX_DOCUMENTED_VIDEO_QUALITY : undefined);
      const payload = await socialFetch(downloadEndpoints[platform], { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ access_key: accessKey, url: input.url, format: input.format, ...(requestedQuality ? { quality: requestedQuality } : {}) }) });
      const metadata = normalizeMetadata(platform, input.url, payload) as Record<string, unknown> | null;
      const data = payload && typeof payload === "object" && (payload as any).data && typeof (payload as any).data === "object" ? (payload as any).data : payload as any;
      const downloadUrl = valueOf(data ?? {}, "downloadUrl", "download_url");
      if (!metadata || typeof downloadUrl !== "string") throw new Error("Unable to retrieve a usable download URL.");
      const format = String(valueOf(data, "format") ?? input.format).toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
      const token = createDownloadToken(downloadUrl, `clipsignal-video.${format}`);
      return { ...metadata, downloadToken: token, format, quality: valueOf(data, "quality") ?? input.quality, expiresIn: valueOf(data, "expiresIn") };
    }),
  }),
});

export type AppRouter = typeof appRouter;
