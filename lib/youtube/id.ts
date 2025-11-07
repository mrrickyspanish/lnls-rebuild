export function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes("youtu.be")) {
      const seg = u.pathname.split("/").filter(Boolean)[0];
      return seg?.length === 11 ? seg : null;
    }
    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && v.length === 11) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      // /shorts/:id or /embed/:id
      const idx = parts.findIndex((p) => p === "shorts" || p === "embed");
      if (idx >= 0 && parts[idx + 1] && parts[idx + 1].length === 11) return parts[idx + 1];
    }
  } catch {}
  return null;
}
