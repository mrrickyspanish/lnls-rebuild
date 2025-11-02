export function formatDateUTC(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'short',   // e.g., Nov
    day: '2-digit',   // e.g., 01
    year: 'numeric',  // e.g., 2025
  }).format(d);
}
