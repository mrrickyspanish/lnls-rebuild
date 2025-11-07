import * as cheerio from "cheerio";

/** Absolutize possibly relative URLs against the page URL */
function abs(src?: string | null, base?: string): string | null {
  if (!src) return null;
  try { return new URL(src, base).toString(); } catch { return src; }
}

/** Try to pick a decent image from HTML when no explicit OG/Twitter tag */
function firstDecentImage($: cheerio.CheerioAPI, baseUrl: string): string | null {
  const candidates: Array<{src: string; w?: number; h?: number}> = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src");
    const w = parseInt($(el).attr("width") ?? "", 10) || 0;
    const h = parseInt($(el).attr("height") ?? "", 10) || 0;
    if (src && !/sprite|logo|icon|favicon/i.test(src)) {
      candidates.push({ src: abs(src, baseUrl)!, w, h });
    }
  });
  // prefer images with some size - use nullish coalescing to handle undefined
  candidates.sort((a,b) => ((b.w ?? 0) * (b.h ?? 0)) - ((a.w ?? 0) * (a.h ?? 0)));
  return candidates[0]?.src ?? null;
}

export async function getOgImage(targetUrl: string): Promise<string | null> {
  try {
    const res = await fetch(targetUrl, {
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    const direct =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="og:image"]').attr("content") ||
      $('meta[property="twitter:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content");

    const best = abs(direct, targetUrl) || firstDecentImage($, targetUrl);
    return best || null;
  } catch {
    return null;
  }
}
