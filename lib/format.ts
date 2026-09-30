/** Turn a free-text description into paragraphs and bullet lists. */
export type Block = { type: "p"; text: string } | { type: "ul"; items: string[] };

export function parseDescription(text: string): Block[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const blocks: Block[] = [];
  for (const line of lines) {
    const bullet = line.match(/^[-*•]\s*(.+)$/);
    if (bullet) {
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ul") last.items.push(bullet[1]);
      else blocks.push({ type: "ul", items: [bullet[1]] });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }
  return blocks;
}

export function dateRange(start: string, end: string, current?: boolean): string {
  const from = start.trim();
  const to = current ? "Present" : end.trim();
  if (from && to) return `${from} – ${to}`;
  return from || to;
}

export function ensureProtocol(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function displayUrl(url: string): string {
  return url.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}
