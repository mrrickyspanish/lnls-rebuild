export async function searchAll(q: string) {
  const query = (q || "").trim();
  if (!query) return [];
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}
