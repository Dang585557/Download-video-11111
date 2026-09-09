# TikTok quality and speed findings

## Sources reviewed

- https://docs.socialkit.dev/api-reference/tiktok-download-api
- https://www.socialkit.dev/tiktok-apis/download
- https://docs.socialkit.dev/api-reference/tiktok-stats-api

## Findings

1. The SocialKit TikTok download endpoint returns a temporary pre-signed `downloadUrl` plus `format`, `quality`, `fileSize`, `duration`, and `expiresIn`.
2. Supported video quality values are 240p, 360p, 480p, 720p, and 1080p. The documented default is 480p. The marketing page says requesting 1080p returns the highest available quality; the API response reports the quality actually used.
3. The provider documentation does not expose a source bitrate or a list of available renditions in the response. Therefore the application cannot independently prove or rank bitrate; it must request the highest supported quality and trust the returned `quality` field.
4. The provider documents a deterministic S3 cache keyed by video ID, format, and quality, with repeat downloads expected to return in under two seconds. The download URL is valid for about one hour and the documented maximum file size is 30 MB.
5. The stats endpoint is not a download source. Its thumbnail/CDN URLs may be IP-bound and should not be used for downloading. The download endpoint is intended to fetch server-side and return a working pre-signed URL.
6. The current application already streams the provider URL through a same-origin proxy using `Readable.fromWeb(upstream.body)`, without decoding, re-encoding, or buffering the complete file in application memory. The current proxy forwards Content-Type and Content-Length when provided.
7. The current backend only sends `quality` when the user selected one. This permits the provider default (documented as 480p), which conflicts with the user's highest-quality requirement. The intended fix is to request `1080p` for MP4 video, then report the provider's returned `quality` without claiming a higher value than returned.
8. The current `socialFetch` performs two attempts with a fixed 600 ms delay and a 25-second request timeout. The download proxy has a 60-second timeout. The provider was observed returning HTTP 503 during prior live tests, so latency and success must be reported separately from application behavior.

## Design implication

For TikTok MP4, request `quality: "1080p"` as the highest documented option, avoid any application-side transcoding, stream the pre-signed file unchanged, and use bounded retry/backoff for transient provider errors. If the provider returns a lower `quality` or no URL, surface the actual result/error rather than inventing metadata.


## Optimization checkpoint — 2026-09-08

The download contract now explicitly sends `quality: "1080p"` for MP4/AVI/WebM requests when the user has not selected a quality. A user-selected quality remains authoritative. Audio-only formats do not receive a fabricated video quality. The backend still passes the provider's returned download URL directly into the same-origin streaming proxy; it does not re-encode, transcode, compress, or buffer the complete file in memory.

Preview requests now opt into SocialKit's documented cache parameters (`cache=true`, `cache_ttl=2592000`) to avoid repeated metadata work. Retry behavior remains limited to transient 429/502/503/504 responses; permanent HTTP errors and provider business errors are not retried, reducing unnecessary wait time.

A live TikTok download request using `quality: "1080p"` was attempted on 2026-09-08. SocialKit returned `success:false`, `code: "insufficient_credits"`, `remaining_credits: 0`, and `shortfall_credits: 1` after approximately 3.45 seconds. Therefore, resolution, bitrate, file size, and end-to-end download speed could not be measured. The application now surfaces this provider business error as a clear no-credits message instead of the misleading generic "usable download URL" error.

The provider did not return a source list containing bitrate/resolution alternatives in the available response, so source ranking beyond the explicit 1080p request cannot be implemented without inventing data. Once provider credits are restored, a public URL test is still required to inspect the actual returned file with `ffprobe` and measure response time.
