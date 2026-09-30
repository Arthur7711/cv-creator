import { extractLinks, getDocumentProxy } from "unpdf";

/**
 * Extract text from a PDF while preserving reading structure:
 * - glyph runs are grouped into lines by their vertical position
 * - wide horizontal gaps inside a line become " | " separators
 * - two-column regions (sidebars, skills/languages side by side) are
 *   emitted column by column so section headings stay with their content
 * - label columns (a heading on the left, content on the right) are
 *   emitted in reading order with the heading on its own line
 */

type Item = { str: string; x0: number; x1: number; y: number; h: number };
type Line = { items: Item[]; y: number; h: number };
type Interval = { g0: number; g1: number };
type Split = { left: Item[]; right: Item[]; next: Interval } | null;

const DATE_ONLY_RE = /^\s*(?:\w{3,9}\.?\s+)?(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:(?:\w{3,9}\.?\s+)?(?:19|20)\d{2}|present|current|now|today)\s*$/i;

function toItems(raw: unknown[]): Item[] {
  const items: Item[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object" || !("str" in entry) || !("transform" in entry)) continue;
    const { str, transform, width, height } = entry as {
      str: string;
      transform: number[];
      width: number;
      height: number;
    };
    if (!str || !str.trim()) continue;
    const h = Math.abs(height || transform[0] || transform[3] || 10);
    items.push({ str, x0: transform[4], x1: transform[4] + width, y: transform[5], h });
  }
  return items;
}

function groupLines(items: Item[]): Line[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x0 - b.x0);
  const lines: Line[] = [];
  for (const item of sorted) {
    const last = lines[lines.length - 1];
    if (last && Math.abs(last.y - item.y) <= Math.max(2, Math.min(last.h, item.h) * 0.5)) {
      last.items.push(item);
    } else {
      lines.push({ items: [item], y: item.y, h: item.h });
    }
  }
  for (const line of lines) line.items.sort((a, b) => a.x0 - b.x0);
  return lines;
}

/** Join a line's items, inserting spaces for small gaps and " | " for large ones. */
function lineText(items: Item[]): string {
  let out = "";
  let prev: Item | null = null;
  for (const item of items) {
    if (prev) {
      const gap = item.x0 - prev.x1;
      if (gap > prev.h * 2.5) out += " | ";
      else if (gap > prev.h * 0.12 && !out.endsWith(" ") && !item.str.startsWith(" ")) out += " ";
    }
    out += item.str;
    prev = item;
  }
  return out.replace(/\s+/g, " ").trim();
}

/** All wide gaps in a line as intervals. */
function gaps(line: Line): Interval[] {
  const result: Interval[] = [];
  for (let i = 1; i < line.items.length; i++) {
    const prev = line.items[i - 1];
    const cur = line.items[i];
    if (cur.x0 - prev.x1 > Math.max(prev.h, cur.h) * 2.5) result.push({ g0: prev.x1, g1: cur.x0 });
  }
  return result;
}

/**
 * Assign a line's items to the left or right of a column gap. Returns null
 * when an item straddles the gap or the gap would collapse, i.e. the line is
 * not compatible with this column layout. The gap narrows as lines are seen.
 */
function splitAt(line: Line, iv: Interval): Split {
  const left: Item[] = [];
  const right: Item[] = [];
  let g0 = iv.g0;
  let g1 = iv.g1;
  for (const item of line.items) {
    if (item.x1 <= iv.g1 && item.x0 < iv.g1) {
      left.push(item);
      g0 = Math.max(g0, item.x1);
    } else if (item.x0 >= iv.g0) {
      right.push(item);
      g1 = Math.min(g1, item.x0);
    } else {
      return null;
    }
  }
  if (g0 >= g1) return null;
  // A line that sits on both sides must have a real gap between them;
  // otherwise it is ordinary text that merely happens to span the boundary.
  if (left.length && right.length) {
    const leftEnd = Math.max(...left.map((i) => i.x1));
    const rightStart = Math.min(...right.map((i) => i.x0));
    const h = Math.max(...line.items.map((i) => i.h));
    if (rightStart - leftEnd < h * 2.5) return null;
  }
  return { left, right, next: { g0, g1 } };
}

function span(items: Item[]): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map((i) => i.x1)) - Math.min(...items.map((i) => i.x0));
}

function chooseStartGap(line: Line, pageWidth: number, isHeading: (s: string) => boolean): Interval | null {
  const candidates = gaps(line).filter((g) => {
    const mid = (g.g0 + g.g1) / 2;
    return mid > pageWidth * 0.15 && mid < pageWidth * 0.85;
  });
  if (candidates.length === 0) return null;
  // Prefer a gap that leaves a section heading on the left (label columns,
  // sidebar headings), otherwise the gap closest to the page centre.
  const headingGap = candidates.find((g) => isHeading(lineText(line.items.filter((i) => i.x1 <= g.g0))));
  if (headingGap) return headingGap;
  return candidates.reduce((best, g) =>
    Math.abs((g.g0 + g.g1) / 2 - pageWidth / 2) < Math.abs((best.g0 + best.g1) / 2 - pageWidth / 2) ? g : best,
  );
}

function flushRun(run: Line[], iv: Interval, pageWidth: number, out: string[], isHeading: (s: string) => boolean) {
  const splits = run.map((line) => splitAt(line, iv) ?? { left: line.items, right: [] as Item[] });
  const pairs = splits.map((s) => ({ left: lineText(s.left), right: lineText(s.right) }));
  const left = pairs.map((p) => p.left).filter(Boolean);
  const right = pairs.map((p) => p.right).filter(Boolean);
  const dateShare = (xs: string[]) => xs.filter((x) => DATE_ONLY_RE.test(x)).length / Math.max(1, xs.length);
  const leftSpan = span(splits.flatMap((s) => s.left));
  const rightSpan = span(splits.flatMap((s) => s.right));

  // Label column: the left side is (mostly) section headings.
  const labelColumn = left.length > 0 && left.filter(isHeading).length * 2 >= left.length;
  // Real columns: both sides carry several lines of reasonable width, and the
  // right side is not just right-aligned dates.
  const realColumns =
    !labelColumn &&
    left.length >= 3 &&
    right.length >= 3 &&
    leftSpan >= pageWidth * 0.15 &&
    rightSpan >= pageWidth * 0.2 &&
    dateShare(right) < 0.5 &&
    dateShare(left) < 0.5;

  if (realColumns) {
    out.push(...left, ...right);
    return;
  }
  for (const { left: l, right: r } of pairs) {
    if (l && r && isHeading(l)) out.push(l, r);
    else if (l && r) out.push(`${l} | ${r}`);
    else out.push(l || r);
  }
}

export function linesFromItems(items: Item[], pageWidth: number, isHeading: (s: string) => boolean): string[] {
  const lines = groupLines(items);
  const out: string[] = [];
  let pending: Line[] = [];
  let run: Line[] = [];
  let iv: Interval | null = null;

  const flushPending = () => {
    for (const line of pending) out.push(lineText(line.items));
    pending = [];
  };
  const endRun = () => {
    if (iv && run.length) flushRun(run, iv, pageWidth, out, isHeading);
    run = [];
    iv = null;
  };
  const startRun = (line: Line, gap: Interval) => {
    // Pull earlier single-column lines that fit the layout into the run so
    // the top of a sidebar stays with the rest of it.
    iv = gap;
    const pulled: Line[] = [];
    while (pending.length) {
      const candidate = pending[pending.length - 1];
      const split = splitAt(candidate, iv);
      if (!split) break;
      iv = split.next;
      pulled.unshift(candidate);
      pending.pop();
    }
    flushPending();
    run = [...pulled];
    const split = splitAt(line, iv);
    if (split) {
      iv = split.next;
      run.push(line);
    } else {
      pending.push(line);
      iv = null;
      run = [];
    }
  };

  for (const line of lines) {
    if (iv) {
      const split = splitAt(line, iv);
      if (split) {
        iv = split.next;
        run.push(line);
        continue;
      }
      endRun();
    }
    const gap = chooseStartGap(line, pageWidth, isHeading);
    if (gap) startRun(line, gap);
    else pending.push(line);
  }
  endRun();
  flushPending();
  return out.filter(Boolean);
}

export async function extractPdfLines(
  bytes: Uint8Array,
  isHeading: (s: string) => boolean,
): Promise<{ lines: string[]; links: string[] }> {
  const pdf = await getDocumentProxy(bytes);
  const lines: string[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const items = toItems(content.items as unknown[]);
    lines.push(...linesFromItems(items, viewport.width, isHeading));
  }
  // Clickable link annotations often carry URLs that are not visible as text.
  let links: string[] = [];
  try {
    links = (await extractLinks(pdf)).links.filter((l) => /^https?:\/\//i.test(l));
  } catch {
    // Links are a bonus; ignore failures.
  }
  return { lines, links };
}
