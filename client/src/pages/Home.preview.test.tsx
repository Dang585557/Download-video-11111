import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PreviewCard } from "./Home";

describe("PreviewCard integration", () => {
  it("renders supplied metadata, hides missing fields, and keeps Download available", () => {
    const markup = renderToStaticMarkup(<PreviewCard data={{
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=abcdefghijk",
      title: "Real provider title",
      author: "Real channel",
      thumbnail: "https://cdn.example.test/thumb.jpg",
      views: 1200,
      qualities: ["720p"],
      canDownload: true,
    }} quality="720p" onQualityChange={vi.fn()} onDownload={vi.fn()} downloading={false} />);

    expect(markup).toContain("Real provider title");
    expect(markup).toContain("Real channel");
    expect(markup).toContain("Download");
    expect(markup).toContain("thumb.jpg");
    expect(markup).not.toContain("Author unavailable");
    expect(markup).not.toContain("Duration unavailable");
    expect(markup).not.toContain("Size unavailable");
    expect(markup).not.toContain("API default");
  });

  it("does not render media or avatar placeholders when API omits them", () => {
    const markup = renderToStaticMarkup(<PreviewCard data={{ platform: "instagram", url: "https://www.instagram.com/reel/ABC/", title: "Caption", qualities: [], canDownload: false }} quality={undefined} onQualityChange={vi.fn()} onDownload={vi.fn()} downloading={false} />);
    expect(markup).not.toContain("preview-media-fallback");
    expect(markup).not.toContain("avatar-fallback");
    expect(markup).not.toContain("Author unavailable");
    expect(markup).not.toContain("Duration unavailable");
    expect(markup).toContain("Download is unavailable");
  });
});
