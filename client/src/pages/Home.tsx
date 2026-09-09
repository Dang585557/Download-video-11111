// Style reminder: Reference-matched dark signal interface — single-column content spine, glass panels, cyan/pink signal accents, and restrained motion.
import React, { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

type Quality = "240p" | "360p" | "480p" | "720p" | "1080p";
type PreviewData = {
  platform: string; url: string; title: string; author?: unknown; profilePicture?: unknown; thumbnail?: unknown;
  views?: unknown; likes?: unknown; comments?: unknown; shares?: unknown; saves?: unknown; publishedAt?: unknown;
  duration?: unknown; durationSeconds?: unknown; fileSize?: unknown; qualities: string[]; canDownload: boolean;
};

export function hasPreviewField(value: unknown) { return value !== undefined && value !== null && value !== ""; }

function displayValue(value: unknown) {
  if (!hasPreviewField(value)) return null;
  if (typeof value === "number") return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  return String(value);
}

function PreviewStat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value?: unknown }) {
  const shown = displayValue(value);
  if (!shown) return null;
  return <div className="preview-stat"><Icon size={15} /><span><small>{label}</small><strong>{shown}</strong></span></div>;
}

export function PreviewCard({ data, quality, onQualityChange, onDownload, downloading, downloadError }: { data: PreviewData; quality: Quality | undefined; onQualityChange: (value: Quality) => void; onDownload: () => void; downloading: boolean; downloadError?: string | null }) {
  const title = displayValue(data.title);
  const platform = data.platform.charAt(0).toUpperCase() + data.platform.slice(1);
  return <section className="preview-card glass-panel reveal" aria-live="polite">
    <div className="preview-header"><div><span className="section-kicker"><CircleCheck size={15} /> VIDEO FOUND</span><h2>Review before download</h2></div><span className="platform-badge"><Video size={13} /> {platform}</span></div>
    <div className="preview-main">
      {typeof data.thumbnail === "string" && <div className="preview-media"><img src={data.thumbnail} alt="Video thumbnail" /><span className="preview-play"><Play size={16} fill="currentColor" /></span></div>}
      <div className="preview-details">
        {hasPreviewField(data.author) && <div className="preview-author">{typeof data.profilePicture === "string" && <img src={data.profilePicture} alt="" />}<span>{displayValue(data.author)}</span></div>}
        {hasPreviewField(title) && <h3>{title}</h3>}
        <div className="preview-facts">{displayValue(data.duration) && <span><Clock3 size={14} /> {displayValue(data.duration)}</span>}{displayValue(data.fileSize) && <span><HardDrive size={14} /> {displayValue(data.fileSize)}</span>}{data.publishedAt !== undefined && data.publishedAt !== null && <span><CalendarDays size={14} /> {String(data.publishedAt).slice(0, 10)}</span>}</div>
      </div>
    </div>
    <div className="preview-stats"><PreviewStat icon={Eye} label="Views" value={data.views} /><PreviewStat icon={Heart} label="Likes" value={data.likes} /><PreviewStat icon={MessageCircle} label="Comments" value={data.comments} /><PreviewStat icon={Share2} label="Shares" value={data.shares} /><PreviewStat icon={Save} label="Saves" value={data.saves} /></div>
    {downloadError && <p className="download-error" role="alert">{downloadError}</p>}
    <div className="preview-actions">{data.canDownload && data.qualities.length > 0 ? <label className="quality-select"><span>Quality</span><select value={quality || data.qualities[0]} onChange={(event) => onQualityChange(event.target.value as Quality)}>{data.qualities.map(item => <option key={item} value={item}>{item}</option>)}</select></label> : data.canDownload ? <p className="quality-auto">Quality: provider default</p> : <p className="unavailable-note">Download is unavailable for this platform through the current API.</p>}<button className="primary-button" onClick={onDownload} disabled={!data.canDownload || downloading}>{downloading ? <LoaderCircle size={17} className="spin" /> : <Download size={17} />}{downloading ? "Preparing" : "Download"}<ArrowUpRight size={16} /></button></div>
  </section>;
}
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Eye,
  HardDrive,
  Heart,
  MessageCircle,
  Save,
  Share2,
  UserRound,
  Check,
  ChevronRight,
  CircleCheck,
  Download,
  ExternalLink,
  FileAudio,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Play,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type CheckState = "idle" | "checking" | "ready" | "error";

function isSupportedUrl(value: string) {
  try {
    const host = new URL(value).hostname;
    return /(^|\.)tiktok\.com$|(^|\.)youtube\.com$|(^|\.)youtu\.be$|(^|\.)facebook\.com$|(^|\.)fb\.watch$|(^|\.)instagram\.com$/i.test(host);
  } catch {
    return false;
  }
}

function AdPlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "ad-placeholder ad-placeholder--compact" : "ad-placeholder"}>
      <div className="ad-visual">
        <div className="ad-play"><Play size={compact ? 18 : 26} fill="currentColor" /></div>
      </div>
      <div className="ad-caption">
        <span>VIDEO ADVERTISEMENT SPACE</span>
        <small>{compact ? "300×250" : "728×90 or 16:9"} AD</small>
      </div>
    </div>
  );
}

function FeatureRow({ icon: Icon, children }: { icon: typeof Download; children: React.ReactNode }) {
  return (
    <li className="feature-row">
      <span className="feature-icon"><Icon size={16} strokeWidth={2.25} /></span>
      <span>{children}</span>
    </li>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [quality, setQuality] = useState<Quality | undefined>(undefined);
  const previewMutation = trpc.downloader.preview.useMutation();
  const downloadMutation = trpc.downloader.download.useMutation();

  const statusCopy = useMemo(() => {
    if (checkState === "checking") return "Checking link…";
    if (checkState === "ready") return "Link looks ready";
    if (checkState === "error") return "Needs a supported link";
    return "Ready for your link";
  }, [checkState]);

  function handleCheck(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setPreview(null);
      setDownloadUrl(null);
      setCheckState("error");
      toast.error("Paste a TikTok, YouTube, Facebook, or Instagram video link first.");
      return;
    }

    if (!isSupportedUrl(trimmed)) {
      setPreview(null);
      setDownloadUrl(null);
      setCheckState("error");
      toast.error("Unsupported URL. Use a public TikTok, YouTube, Facebook, or Instagram video link.");
      return;
    }
    setCheckState("checking");
    setDownloadUrl(null);
    setPreview(null);
    previewMutation.mutate({ url: trimmed }, {
      onSuccess: (result) => { setCheckState("ready"); setPreview(result as PreviewData); setQuality((result.qualities?.[0] as Quality) || undefined); toast.success("Video found. Review the details before downloading."); },
      onError: (error) => { setCheckState("error"); toast.error(error.message || "Unable to retrieve video information."); },
    });
  }

  function handleDemoDownload() {
    if (!preview) return;
    setDownloadError(null);
    downloadMutation.mutate({ url: preview.url, quality }, {
      onSuccess: (result) => { setDownloadUrl(result.downloadToken); const link = document.createElement("a"); link.href = `/api/download/${encodeURIComponent(result.downloadToken)}`; link.download = `video.${result.format || "mp4"}`; document.body.appendChild(link); link.click(); link.remove(); toast.success("Download started."); },
      onError: (error) => { const message = error.message || "Download failed."; setDownloadUrl(null); setDownloadError(message); setCheckState("error"); toast.error(message); },
    });
  }

  return (
    <div className="site-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />
      <main className="page-wrap">
        <header className="site-header reveal reveal--one">
          <a className="brand" href="#top" aria-label="ClipSignal home">
            <span className="brand-mark-wrap"><Video size={22} strokeWidth={2.3} aria-hidden="true" /></span>
            <span className="brand-copy">
              <span className="brand-name">Clip<span>Signal</span></span>
              <span className="brand-tag">TIKTOK VIDEO UTILITY</span>
            </span>
          </a>
          <div className="header-meta">
            <span className="live-dot" />
            <span>FAST · SIMPLE · CLEAR</span>
          </div>
        </header>

        <section id="top" className="hero-section reveal reveal--two">
          <div className="hero-content">
            <div className="eyebrow"><Sparkles size={14} /> A CLEANER WAY TO START</div>
            <h1>Download Video <em>TikTok</em></h1>
            <p>Paste a link. Check the signal. Keep your workflow moving.</p>
          </div>
          <div className="hero-signal" aria-hidden="true"><span /><span /><span /></div>
        </section>

        <section className="input-card glass-panel reveal reveal--three" aria-labelledby="link-heading">
          <div className="section-kicker"><Link2 size={16} /> INPUT</div>
          <div className="input-heading-row">
            <div>
              <h2 id="link-heading">Paste your video link</h2>
              <p>Use a public video URL from TikTok, YouTube, Facebook, or Instagram.</p>
            </div>
            <div className={`status-pill status-pill--${checkState}`}>
              {checkState === "checking" ? <LoaderCircle size={13} className="spin" /> : checkState === "ready" ? <CircleCheck size={13} /> : checkState === "error" ? <AlertTriangle size={13} /> : <span className="status-dot" />}
              {statusCopy}
            </div>
          </div>
          <form className="link-form" onSubmit={handleCheck}>
            <label className="sr-only" htmlFor="tiktok-url">TikTok video URL</label>
            <div className={`url-field url-field--${checkState}`}>
              <Link2 size={18} aria-hidden="true" />
              <input
                id="tiktok-url"
                type="url"
                value={url}
                onChange={(event) => { setUrl(event.target.value); if (checkState !== "idle") setCheckState("idle"); }}
                placeholder="https://www.tiktok.com/@user/video/... or youtube.com/watch?..."
                autoComplete="url"
              />
              {url && <button type="button" className="clear-link" onClick={() => setUrl("")} aria-label="Clear link">×</button>}
            </div>
            <button className="primary-button" type="submit" disabled={checkState === "checking"}>
              {checkState === "checking" ? <LoaderCircle size={17} className="spin" /> : <ScanSearch size={17} />}
              {checkState === "checking" ? "Downloading" : "Check & download"}
              <ArrowUpRight size={16} />
            </button>
          </form>
          <div className="input-footnote"><ShieldCheck size={14} /> No registration required <span>•</span> API key stays on the server</div>
        </section>

        {preview && <PreviewCard data={preview} quality={quality} onQualityChange={setQuality} onDownload={handleDemoDownload} downloading={downloadMutation.isPending} downloadError={downloadError} />}

        <section className="ad-section reveal reveal--four" aria-labelledby="ad-heading">
          <div className="section-title-row">
            <div><span className="section-number">01</span><h2 id="ad-heading">Advertisement</h2></div>
            <span className="section-note">SPONSORED SPACE</span>
          </div>
          <AdPlaceholder />
        </section>

        <section className="ad-grid reveal reveal--five" aria-label="Additional advertisement spaces">
          <div className="ad-section ad-section--compact">
            <div className="section-title-row"><div><span className="section-number">02</span><h2>Advertisement</h2></div><ExternalLink size={15} /></div>
            <AdPlaceholder compact />
          </div>
          <div className="ad-section ad-section--compact ad-section--pink">
            <div className="section-title-row"><div><span className="section-number">03</span><h2>Advertisement</h2></div><ExternalLink size={15} /></div>
            <AdPlaceholder compact />
          </div>
        </section>

        <section className="about-card glass-panel reveal reveal--six" aria-labelledby="about-heading">
          <div className="about-topline"><span>WHY CLIPSIGNAL</span><Zap size={17} /></div>
          <h2 id="about-heading">A focused way to handle social video links.</h2>
          <p className="about-lead">ClipSignal is a fast, clear starting point for checking public TikTok video links before a download workflow begins. No clutter, no account wall, and no mystery status.</p>
          <div className="about-grid">
            <div>
              <h3>Built for the quick moment</h3>
              <p>Paste your link, get an immediate signal, and stay in control of what happens next.</p>
            </div>
            <ul className="feature-list">
              <FeatureRow icon={Download}>Video download workflow ready</FeatureRow>
              <FeatureRow icon={FileAudio}>Audio export support planned</FeatureRow>
              <FeatureRow icon={Zap}>Fast, lightweight interface</FeatureRow>
              <FeatureRow icon={LockKeyhole}>No registration wall</FeatureRow>
            </ul>
          </div>
          <div className="personal-use"><AlertTriangle size={16} /><span><strong>For personal use only.</strong> Respect copyright, creator rights, and platform rules when using any downloaded media.</span></div>
        </section>

        <section className="trust-strip reveal reveal--seven">
          <div><LockKeyhole size={16} /><span>PRIVATE BY DEFAULT</span></div>
          <div><ShieldCheck size={16} /><span>TRANSPARENT STATUS</span></div>
          <div><Video size={16} /><span>VIDEO-FIRST FLOW</span></div>
        </section>

        <footer className="site-footer">
          <div className="footer-brand"><span className="footer-glyph"><Video size={13} strokeWidth={2.3} /></span><span>ClipSignal</span></div>
          <p>© 2026 ClipSignal. A focused interface for TikTok video link workflows.</p>
          <a href="#top">Back to top <ArrowUpRight size={14} /></a>
        </footer>
      </main>
    </div>
  );
}
